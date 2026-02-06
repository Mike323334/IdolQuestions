from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Optional
import os
from groq import Groq
import json
import stripe
import httpx
import re
from dotenv import load_dotenv
import traceback
import unicodedata
import difflib
import firebase_admin
from firebase_admin import credentials, auth as admin_auth, firestore
from google.cloud.firestore import SERVER_TIMESTAMP
from security_alerts import security_alerts

load_dotenv()

firebase_app = None
firestore_client = None

def init_firebase_admin():
    global firebase_app, firestore_client
    if firebase_app:
        return
    try:
        if os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
            firebase_app = firebase_admin.initialize_app()
        else:
            firebase_app = firebase_admin.initialize_app()
        firestore_client = firestore.client()
    except Exception as e:
        print(f"Failed to initialize Firebase Admin SDK: {str(e)}")

init_firebase_admin()
app = FastAPI(title="Quiz Questions Generator API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001","https://idolquestions-1.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class QuestionRequest(BaseModel):
    creator_name: str
    creator_niche: Optional[str] = None  # e.g., "fitness", "fashion", "comedy"
    creator_bio: Optional[str] = None
    number_of_questions: int = 5
    question_type: Optional[str] = "engaging"  # "engaging", "personal", "funny", "deep"
    target_audience: Optional[str] = "fans"  # "fans", "followers"

class QuestionOption(BaseModel):
    text: str
    is_correct: bool = False

class GeneratedQuestion(BaseModel):
    text: str
    options: List[str]
    category: str
    label: str
    explanation: Optional[str] = None

class QuestionResponse(BaseModel):
    questions: List[GeneratedQuestion]
    success: bool
    message: str

class OptionGenerationRequest(BaseModel):
    question_text: str
    creator_name: Optional[str] = None
    creator_niche: Optional[str] = None
    creator_bio: Optional[str] = None
    existing_options: Optional[List[str]] = None
    target_count: Optional[int] = 8

class OptionGenerationResponse(BaseModel):
    options: List[str]
    success: bool
    message: str

def generate_engaging_questions(
    creator_name: str,
    niche: Optional[str],
    bio: Optional[str],
    num_questions: int,
    question_type: str,
    target_audience: str
) -> List[GeneratedQuestion]:
    """
    Generate engaging questions using Groq AI that will attract fans to pay for answers
    """
    
    # Build context for the AI
    context = f"""
Eres un experto en crear preguntas de cuestionarios que generan curiosidad y engagement para creadores de contenido.

Creador: {creator_name}
Nicho: {niche or "general"}
Bio: {bio or "No proporcionada"}
Tipo de pregunta: {question_type}
Audiencia objetivo: {target_audience}

IMPORTANTE: Las preguntas deben ser:
1. MUY INTERESANTES y generar curiosidad genuina
2. PERSONALES pero no invasivas
3. DIVERTIDAS o intrigantes
4. Que los fans realmente quieran saber la respuesta
5. Que justifiquen pagar por conocer las respuestas del creador

Genera {num_questions} preguntas en formato JSON. Cada pregunta debe tener:
- text: La pregunta (debe ser atractiva y generar curiosidad)
- options: 8 opciones de respuesta (una debe ser la correcta según el creador)
- category: Categoría (ej: "Preguntas Generales", "Preguntas Personales", "Preguntas Divertidas")
- label: Etiqueta descriptiva (ej: "Rutina Diaria", "Gustos Personales", "Secretos Revelados")
- explanation: Por qué esta pregunta es interesante para los fans

Formato JSON esperado:
{{
  "questions": [
    {{
      "text": "¿Cuál es el ritual secreto que haces antes de cada grabación?",
      "options": ["Tomar 3 sorbos de agua", "Bailar 30 segundos", "Revisar el espejo 5 veces", "Escuchar tu canción favorita", "Poner una alarma", "Tomar un selfie", "Calentar la voz", "Respirar profundo"],
      "category": "Preguntas Generales",
      "label": "Ritual Pre-Grabación",
      "explanation": "Los fans quieren conocer los hábitos secretos de sus creadores favoritos"
    }}
  ]
}}
"""

    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "Eres un experto en crear preguntas de cuestionarios que generan curiosidad y engagement. Siempre responde en formato JSON válido."
                },
                {
                    "role": "user",
                    "content": context
                }
            ],
            model="llama-3.3-70b-versatile",  # or "mixtral-8x7b-32768" for faster responses
            temperature=0.9,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )
        
        response_text = chat_completion.choices[0].message.content
        response_data = json.loads(response_text)
        
        def normalize_option(value: str) -> str:
            value = value.strip().lower()
            value = unicodedata.normalize("NFKD", value)
            value = "".join(ch for ch in value if not unicodedata.combining(ch))
            value = re.sub(r"\s+", " ", value)
            return value

        def is_similar_option(value: str, existing_values: List[str]) -> bool:
            normalized_value = normalize_option(value)
            value_tokens = set(re.findall(r"[a-z0-9]+", normalized_value))
            for existing in existing_values:
                normalized_existing = normalize_option(existing)
                existing_tokens = set(re.findall(r"[a-z0-9]+", normalized_existing))
                if normalized_value == normalized_existing:
                    return True
                if normalized_value in normalized_existing or normalized_existing in normalized_value:
                    return True
                if value_tokens and existing_tokens:
                    overlap = len(value_tokens & existing_tokens) / max(len(value_tokens), 1)
                    if overlap >= 0.55:
                        return True
                similarity = difflib.SequenceMatcher(a=normalized_value, b=normalized_existing).ratio()
                if similarity >= 0.6:
                    return True
            return False

        def merge_unique_options(existing: List[str], generated: List[str], target_count: int) -> List[str]:
            merged: List[str] = []

            for value in existing + generated:
                value = str(value).strip()
                if value and not is_similar_option(value, merged):
                    merged.append(value)

            return merged[:target_count]

        questions = []
        for q in response_data.get("questions", []):
            raw_options = q.get("options", []) or []
            desired_count = 8
            if len(raw_options) < desired_count:
                try:
                    generated = generate_question_options(
                        question_text=q.get("text", ""),
                        creator_name=creator_name,
                        niche=niche,
                        bio=bio,
                        existing_options=raw_options,
                        target_count=desired_count,
                    )
                    raw_options = merge_unique_options(raw_options, generated, desired_count)
                except Exception as gen_error:
                    print(f"Failed to expand options for generated question: {gen_error}")

            questions.append(GeneratedQuestion(
                text=q.get("text", ""),
                options=raw_options,
                category=q.get("category", "Preguntas Generales"),
                label=q.get("label", "General"),
                explanation=q.get("explanation")
            ))
        
        return questions
        
    except Exception as e:
        print(f"Error generating questions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")

def generate_question_options(
    question_text: str,
    creator_name: Optional[str],
    niche: Optional[str],
    bio: Optional[str],
    existing_options: Optional[List[str]] = None,
    target_count: int = 8,
) -> List[str]:
    safe_existing = [str(opt) for opt in (existing_options or []) if str(opt).strip()]
    desired_count = max(8, target_count or 8)
    existing_text = ""
    if safe_existing:
        joined = "; ".join(safe_existing)
        existing_text = f"\nOpciones existentes (deben mantenerse): {joined}\n"

    context = f"""
Eres un experto en crear opciones de respuesta para preguntas de cuestionarios.

Pregunta: {question_text}
Creador: {creator_name or "No especificado"}
Nicho: {niche or "general"}
Bio: {bio or "No proporcionada"}
{existing_text}

Genera {desired_count} opciones de respuesta plausibles y variadas.
No uses respuestas comodín como "Ninguna de las anteriores".
Evita opciones repetidas o demasiado parecidas entre sí.
Si hay opciones existentes, inclúyelas exactamente y agrega nuevas opciones distintas hasta completar {desired_count}.
Responde en formato JSON:
{{
  "options": ["Opcion 1", "Opcion 2", "Opcion 3", "Opcion 4", "Opcion 5", "Opcion 6", "Opcion 7", "Opcion 8"]
}}
"""

    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "Eres un experto en crear opciones de respuesta. Siempre responde en formato JSON valido."
                },
                {
                    "role": "user",
                    "content": context
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=400,
            response_format={"type": "json_object"}
        )

        response_text = chat_completion.choices[0].message.content
        response_data = json.loads(response_text)
        options = response_data.get("options", [])
        if not isinstance(options, list):
            options = []
        def normalize_option(value: str) -> str:
            value = value.strip().lower()
            value = unicodedata.normalize("NFKD", value)
            value = "".join(ch for ch in value if not unicodedata.combining(ch))
            value = re.sub(r"\s+", " ", value)
            return value

        def is_similar_option(value: str, existing_values: List[str]) -> bool:
            normalized_value = normalize_option(value)
            value_tokens = set(re.findall(r"[a-z0-9]+", normalized_value))
            for existing in existing_values:
                normalized_existing = normalize_option(existing)
                existing_tokens = set(re.findall(r"[a-z0-9]+", normalized_existing))
                if normalized_value == normalized_existing:
                    return True
                if normalized_value in normalized_existing or normalized_existing in normalized_value:
                    return True
                if value_tokens and existing_tokens:
                    overlap = len(value_tokens & existing_tokens) / max(len(value_tokens), 1)
                    if overlap >= 0.55:
                        return True
                similarity = difflib.SequenceMatcher(a=normalized_value, b=normalized_existing).ratio()
                if similarity >= 0.6:
                    return True
            return False

        cleaned: List[str] = []
        for opt in options:
            opt_str = str(opt).strip()
            if opt_str and not is_similar_option(opt_str, cleaned):
                cleaned.append(opt_str)

        return cleaned[:desired_count]

    except Exception as e:
        print(f"Error generating options: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating options: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Quiz Questions Generator API", "status": "running"}

@app.post("/api/generate-questions", response_model=QuestionResponse)
async def generate_questions(request: QuestionRequest):
    """
    Generate engaging questions for content creators using Groq AI
    """
    try:
        if not os.getenv("GROQ_API_KEY"):
            raise HTTPException(
                status_code=500,
                detail="GROQ_API_KEY not configured. Please set it in environment variables."
            )
        
        questions = generate_engaging_questions(
            creator_name=request.creator_name,
            niche=request.creator_niche,
            bio=request.creator_bio,
            num_questions=request.number_of_questions,
            question_type=request.question_type,
            target_audience=request.target_audience
        )
        
        return QuestionResponse(
            questions=questions,
            success=True,
            message=f"Successfully generated {len(questions)} engaging questions"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/generate-options", response_model=OptionGenerationResponse)
async def generate_options(request: OptionGenerationRequest):
    """
    Generate answer options for a custom question using Groq AI
    """
    try:
        if not os.getenv("GROQ_API_KEY"):
            raise HTTPException(
                status_code=500,
                detail="GROQ_API_KEY not configured. Please set it in environment variables."
            )

        if not request.question_text.strip():
            raise HTTPException(status_code=400, detail="question_text is required")

        options = generate_question_options(
            question_text=request.question_text,
            creator_name=request.creator_name,
            niche=request.creator_niche,
            bio=request.creator_bio,
            existing_options=request.existing_options,
            target_count=request.target_count or 8,
        )

        return OptionGenerationResponse(
            options=options,
            success=True,
            message="Successfully generated options"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

class PaymentIntentRequest(BaseModel):
    amount: int  # Amount in cents
    currency: str = "usd"
    quiz_id: str
    user_id: str
    quiz_title: str
    creator_name: str
    creator_stripe_account_id: str

class PaymentIntentResponse(BaseModel):
    client_secret: str
    success: bool

class StripeConnectRequest(BaseModel):
    email: Optional[str] = None
    country: Optional[str] = None

class StripeConnectResponse(BaseModel):
    account_id: str
    onboarding_url: str
    success: bool

class UsernameCheckRequest(BaseModel):
    username: str

class UsernameCheckResponse(BaseModel):
    available: bool
    message: str

class QuestionProposal(BaseModel):
    id: Optional[str] = None
    question_text: str
    options: List[str]
    correct_answer: Optional[int] = None  # Will be set by creator when reviewing
    category: Optional[str] = None
    explanation: Optional[str] = None
    follower_id: str
    follower_name: str
    creator_id: str
    creator_name: str
    status: str = "pending"  # pending, approved, rejected
    created_at: Optional[str] = None
    reviewed_at: Optional[str] = None
    review_comment: Optional[str] = None

class CreateProposalRequest(BaseModel):
    question_text: str
    options: List[str]
    correct_answer: Optional[int] = None  # Optional since follower doesn't select it
    category: Optional[str] = None
    explanation: Optional[str] = None
    creator_id: str
    creator_name: str

class ProposalResponse(BaseModel):
    success: bool
    message: str
    proposal_id: Optional[str] = None

class ReviewProposalRequest(BaseModel):
    proposal_id: str
    status: str  # approved, rejected
    correct_answer: Optional[int] = None  # Creator sets the correct answer when approving
    review_comment: Optional[str] = None

class ProposalsListResponse(BaseModel):
    proposals: List[QuestionProposal]
    success: bool

def get_bearer_token(request: Request) -> Optional[str]:
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None
    parts = auth_header.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1]

def require_firebase_user(request: Request):
    token = get_bearer_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Missing auth token")
    try:
        decoded = admin_auth.verify_id_token(token)
        return decoded
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid auth token")

def get_user_profile(uid: str):
    if not firestore_client:
        raise HTTPException(status_code=500, detail="Firebase Admin not configured")
    doc_ref = firestore_client.collection("users").document(uid)
    snapshot = doc_ref.get()
    if not snapshot.exists:
        return None
    return snapshot.to_dict()

@app.post("/api/create-payment-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(request: PaymentIntentRequest, http_request: Request):
    """
    Create a Stripe payment intent for unlocking quiz answers
    """
    try:
        if not os.getenv("STRIPE_SECRET_KEY"):
            raise HTTPException(
                status_code=500,
                detail="STRIPE_SECRET_KEY not configured"
            )
        if request.amount <= 0:
            raise HTTPException(status_code=400, detail="Invalid amount")
        if not request.creator_stripe_account_id:
            raise HTTPException(status_code=400, detail="Missing creator Stripe account")

        decoded = require_firebase_user(http_request)
        if decoded.get("uid") != request.user_id:
            raise HTTPException(status_code=403, detail="User mismatch")

        profile = get_user_profile(decoded.get("uid"))
        if not profile:
            raise HTTPException(status_code=403, detail="User profile not found")
        if profile.get("role") != "Follower":
            raise HTTPException(status_code=403, detail="Only followers can purchase answers")
        
        application_fee = int(request.amount * 0.20)
        intent = stripe.PaymentIntent.create(
            amount=request.amount,
            currency=request.currency,
            application_fee_amount=application_fee,
            transfer_data={
                "destination": request.creator_stripe_account_id,
            },
            metadata={
                "quiz_id": str(request.quiz_id),
                "user_id": request.user_id,
                "quiz_title": request.quiz_title,
                "creator_name": request.creator_name,
                "creator_stripe_account_id": request.creator_stripe_account_id,
            },
        )
        
        return PaymentIntentResponse(
            client_secret=intent.client_secret,
            success=True
        )
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating payment intent: {str(e)}")

@app.post("/api/confirm-payment")
async def confirm_payment(payment_intent_id: str):
    """
    DEPRECATED: Check payment status
    For security, access is only granted via verified webhooks
    Use /api/quiz/{quiz_id}/access to check verified access
    """
    try:
        if not os.getenv("STRIPE_SECRET_KEY"):
            raise HTTPException(status_code=500, detail="STRIPE_SECRET_KEY not configured")
        
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        # Return status but don't grant access here
        # Access is only granted via secure webhook verification
        return {
            "success": intent.status == "succeeded",
            "message": f"Payment status: {intent.status}. Access verified via webhook.",
            "quiz_id": intent.metadata.get("quiz_id"),
            "user_id": intent.metadata.get("user_id"),
            "note": "Access is granted only after webhook verification"
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error confirming payment: {str(e)}")

@app.post("/api/stripe/connect-account", response_model=StripeConnectResponse)
async def create_connect_account(request: StripeConnectRequest, http_request: Request):
    """
    Create a Stripe Connect Express account and return onboarding link.
    """
    try:
        if not os.getenv("STRIPE_SECRET_KEY"):
            raise HTTPException(
                status_code=500,
                detail="STRIPE_SECRET_KEY not configured"
            )

        decoded = require_firebase_user(http_request)
        profile = get_user_profile(decoded.get("uid"))
        if not profile:
            raise HTTPException(status_code=403, detail="User profile not found")
        if profile.get("role") != "Content Creator":
            raise HTTPException(status_code=403, detail="Only content creators can connect Stripe")

        connect_country = request.country or os.getenv("STRIPE_CONNECT_COUNTRY") or "US"
        account = stripe.Account.create(
            type="express",
            country=connect_country,
            email=request.email or profile.get("email"),
            capabilities={
                "card_payments": {"requested": True},
                "transfers": {"requested": True},
            },
        )

        account_link = stripe.AccountLink.create(
            account=account.id,
            refresh_url="https://idolquestions-1.onrender.com/settings?stripe=refresh",
            return_url="https://idolquestions-1.onrender.com/settings?stripe=success",
            type="account_onboarding",
        )

        return StripeConnectResponse(
            account_id=account.id,
            onboarding_url=account_link.url,
            success=True,
        )
    except stripe.error.StripeError as e:
        message = e.user_message or str(e)
        print(f"Stripe error creating connect account: {message}")
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=message)
    except Exception as e:
        print(f"Error creating connect account: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error creating connect account: {str(e)}")

@app.post("/api/check-username", response_model=UsernameCheckResponse)
async def check_username_availability(request: UsernameCheckRequest):
    """Check if a username is available (unique)"""
    try:
        if not firestore_client:
            raise HTTPException(status_code=500, detail="Firebase Admin not configured")
        
        username = request.username.strip()
        
        # Basic validation
        if len(username) < 3:
            return UsernameCheckResponse(
                available=False,
                message="El nombre de usuario debe tener al menos 3 caracteres"
            )
        
        if len(username) > 30:
            return UsernameCheckResponse(
                available=False,
                message="El nombre de usuario no puede tener más de 30 caracteres"
            )
        
        # Check for invalid characters (only allow alphanumeric, underscore, hyphen)
        if not re.match(r'^[a-zA-Z0-9_-]+$', username):
            return UsernameCheckResponse(
                available=False,
                message="El nombre de usuario solo puede contener letras, números, guiones y guiones bajos"
            )
        
        # Check if username already exists (case-insensitive)
        users_ref = firestore_client.collection("users")
        
        # Query for exact match (case-sensitive first)
        exact_query = users_ref.where("username", "==", username).limit(1)
        exact_docs = exact_query.get()
        
        if exact_docs:
            return UsernameCheckResponse(
                available=False,
                message="Este nombre de usuario ya está en uso"
            )
        
        # Query for case-insensitive match
        case_insensitive_query = users_ref.where("username", ">=", username.lower()).where("username", "<=", username.lower() + "\uf8ff").limit(50)
        case_docs = case_insensitive_query.get()
        
        for doc in case_docs:
            existing_username = doc.to_dict().get("username", "")
            if existing_username.lower() == username.lower():
                return UsernameCheckResponse(
                    available=False,
                    message="Este nombre de usuario ya está en uso"
                )
        
        return UsernameCheckResponse(
            available=True,
            message="Nombre de usuario disponible"
        )
        
    except Exception as e:
        print(f"Error checking username availability: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error checking username: {str(e)}")

@app.get("/api/content-creators")
async def get_content_creators():
    """Get list of content creators for proposal selection"""
    try:
        if not firestore_client:
            raise HTTPException(status_code=500, detail="Firebase Admin not configured")
        
        # Query for content creators
        users_ref = firestore_client.collection("users")
        query = users_ref.where("role", "==", "Content Creator").limit(50)
        
        creators = []
        for doc in query.get():
            data = doc.to_dict()
            creators.append({
                "id": doc.id,
                "username": data.get("username", "Sin nombre"),
                "email": data.get("email", "")
            })
        
        return {"creators": creators, "success": True}
        
    except Exception as e:
        print(f"Error getting content creators: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error getting creators: {str(e)}")

# Alternative endpoint for testing
@app.get("/api/creators")
async def get_creators_simple():
    """Simple endpoint to get content creators"""
    try:
        if not firestore_client:
            return {"creators": [], "success": False, "message": "Firebase not configured"}
        
        users_ref = firestore_client.collection("users")
        query = users_ref.where("role", "==", "Content Creator").limit(50)
        
        creators = []
        for doc in query.get():
            data = doc.to_dict()
            creators.append({
                "id": doc.id,
                "username": data.get("username", "Sin nombre"),
                "email": data.get("email", "")
            })
        
        return {"creators": creators, "success": True}
        
    except Exception as e:
        print(f"Error in simple creators endpoint: {str(e)}")
        return {"creators": [], "success": False, "message": str(e)}

@app.post("/api/propose-question", response_model=ProposalResponse)
async def create_question_proposal(request: CreateProposalRequest, http_request: Request):
    """Create a new question proposal from a follower to a creator"""
    try:
        if not firestore_client:
            raise HTTPException(status_code=500, detail="Firebase Admin not configured")
        
        # Verify user authentication
        decoded = require_firebase_user(http_request)
        follower_profile = get_user_profile(decoded.get("uid"))
        
        if not follower_profile:
            raise HTTPException(status_code=403, detail="User profile not found")
        
        if follower_profile.get("role") != "Follower":
            raise HTTPException(status_code=403, detail="Only followers can propose questions")
        
        # Validate request data
        if len(request.options) < 4:
            raise HTTPException(status_code=400, detail="At least 4 options are required")
        
        if len(request.options) > 8:
            raise HTTPException(status_code=400, detail="Maximum 8 options allowed")
        
        # Correct answer is optional for proposals - creator will set it later
        
        if not request.question_text.strip():
            raise HTTPException(status_code=400, detail="Question text is required")
        
        # Verify creator exists
        creator_ref = firestore_client.collection("users").document(request.creator_id)
        creator_doc = creator_ref.get()
        if not creator_doc.exists:
            raise HTTPException(status_code=404, detail="Creator not found")
        
        creator_data = creator_doc.to_dict()
        if creator_data.get("role") != "Content Creator":
            raise HTTPException(status_code=400, detail="Target user is not a content creator")
        
        # Create proposal document
        proposal_data = {
            "question_text": request.question_text.strip(),
            "options": [opt.strip() for opt in request.options],
            "correct_answer": None,  # Creator will set this when reviewing
            "category": request.category or "General",
            "explanation": request.explanation,
            "follower_id": decoded.get("uid"),
            "follower_name": follower_profile.get("username"),
            "creator_id": request.creator_id,
            "creator_name": request.creator_name,
            "status": "pending",
            "created_at": SERVER_TIMESTAMP,
            "reviewed_at": None,
            "review_comment": None
        }
        
        # Save to Firestore
        proposals_ref = firestore_client.collection("question_proposals")
        doc_ref = proposals_ref.add(proposal_data)
        
        return ProposalResponse(
            success=True,
            message="Propuesta enviada exitosamente",
            proposal_id=doc_ref[1].id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating question proposal: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error creating proposal: {str(e)}")

@app.get("/api/proposals/received", response_model=ProposalsListResponse)
async def get_received_proposals(http_request: Request):
    """Get proposals received by a content creator"""
    try:
        if not firestore_client:
            raise HTTPException(status_code=500, detail="Firebase Admin not configured")
        
        # Verify user authentication
        decoded = require_firebase_user(http_request)
        creator_profile = get_user_profile(decoded.get("uid"))
        
        if not creator_profile:
            raise HTTPException(status_code=403, detail="User profile not found")
        
        if creator_profile.get("role") != "Content Creator":
            raise HTTPException(status_code=403, detail="Only content creators can view received proposals")
        
        # Query proposals for this creator
        proposals_ref = firestore_client.collection("question_proposals")
        query = proposals_ref.where("creator_id", "==", decoded.get("uid")).order_by("created_at", direction=firestore.Query.DESCENDING)
        
        proposals = []
        for doc in query.get():
            data = doc.to_dict()
            proposal = QuestionProposal(
                id=doc.id,
                question_text=data.get("question_text"),
                options=data.get("options", []),
                correct_answer=data.get("correct_answer", 0),
                category=data.get("category"),
                explanation=data.get("explanation"),
                follower_id=data.get("follower_id"),
                follower_name=data.get("follower_name"),
                creator_id=data.get("creator_id"),
                creator_name=data.get("creator_name"),
                status=data.get("status", "pending"),
                created_at=data.get("created_at").isoformat() if data.get("created_at") else None,
                reviewed_at=data.get("reviewed_at").isoformat() if data.get("reviewed_at") else None,
                review_comment=data.get("review_comment")
            )
            proposals.append(proposal)
        
        return ProposalsListResponse(
            proposals=proposals,
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting received proposals: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error getting proposals: {str(e)}")

@app.get("/api/proposals/sent", response_model=ProposalsListResponse)
async def get_sent_proposals(http_request: Request):
    """Get proposals sent by a follower"""
    try:
        if not firestore_client:
            raise HTTPException(status_code=500, detail="Firebase Admin not configured")
        
        # Verify user authentication
        decoded = require_firebase_user(http_request)
        follower_profile = get_user_profile(decoded.get("uid"))
        
        if not follower_profile:
            raise HTTPException(status_code=403, detail="User profile not found")
        
        if follower_profile.get("role") != "Follower":
            raise HTTPException(status_code=403, detail="Only followers can view sent proposals")
        
        # Query proposals from this follower
        proposals_ref = firestore_client.collection("question_proposals")
        query = proposals_ref.where("follower_id", "==", decoded.get("uid")).order_by("created_at", direction=firestore.Query.DESCENDING)
        
        proposals = []
        for doc in query.get():
            data = doc.to_dict()
            proposal = QuestionProposal(
                id=doc.id,
                question_text=data.get("question_text"),
                options=data.get("options", []),
                correct_answer=data.get("correct_answer", 0),
                category=data.get("category"),
                explanation=data.get("explanation"),
                follower_id=data.get("follower_id"),
                follower_name=data.get("follower_name"),
                creator_id=data.get("creator_id"),
                creator_name=data.get("creator_name"),
                status=data.get("status", "pending"),
                created_at=data.get("created_at").isoformat() if data.get("created_at") else None,
                reviewed_at=data.get("reviewed_at").isoformat() if data.get("reviewed_at") else None,
                review_comment=data.get("review_comment")
            )
            proposals.append(proposal)
        
        return ProposalsListResponse(
            proposals=proposals,
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting sent proposals: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error getting proposals: {str(e)}")

@app.post("/api/proposals/{proposal_id}/review", response_model=ProposalResponse)
async def review_proposal(proposal_id: str, request: ReviewProposalRequest, http_request: Request):
    """Review a question proposal (approve/reject)"""
    try:
        if not firestore_client:
            raise HTTPException(status_code=500, detail="Firebase Admin not configured")
        
        # Verify user authentication
        decoded = require_firebase_user(http_request)
        creator_profile = get_user_profile(decoded.get("uid"))
        
        if not creator_profile:
            raise HTTPException(status_code=403, detail="User profile not found")
        
        if creator_profile.get("role") != "Content Creator":
            raise HTTPException(status_code=403, detail="Only content creators can review proposals")
        
        if request.status not in ["approved", "rejected"]:
            raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")
        
        # Get proposal document
        proposal_ref = firestore_client.collection("question_proposals").document(proposal_id)
        proposal_doc = proposal_ref.get()
        
        if not proposal_doc.exists:
            raise HTTPException(status_code=404, detail="Proposal not found")
        
        proposal_data = proposal_doc.to_dict()
        
        # Verify this creator owns the proposal
        if proposal_data.get("creator_id") != decoded.get("uid"):
            raise HTTPException(status_code=403, detail="You can only review proposals sent to you")
        
        # Update proposal status
        update_data = {
            "status": request.status,
            "reviewed_at": SERVER_TIMESTAMP,
            "review_comment": request.review_comment
        }
        
        # If approving, require correct answer to be set
        if request.status == "approved":
            if request.correct_answer is None:
                raise HTTPException(status_code=400, detail="Correct answer must be specified when approving")
            if request.correct_answer < 0 or request.correct_answer >= len(proposal_data.get("options", [])):
                raise HTTPException(status_code=400, detail="Invalid correct answer index")
            update_data["correct_answer"] = request.correct_answer
        
        proposal_ref.update(update_data)
        
        # If approved, optionally add to creator's question bank
        if request.status == "approved":
            # You could add logic here to automatically add approved questions
            # to the creator's question bank for future quizzes
            pass
        
        status_text = "aprobada" if request.status == "approved" else "rechazada"
        return ProposalResponse(
            success=True,
            message=f"Propuesta {status_text} exitosamente"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error reviewing proposal: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error reviewing proposal: {str(e)}")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "groq_configured": bool(os.getenv("GROQ_API_KEY")),
        "stripe_configured": bool(os.getenv("STRIPE_SECRET_KEY")),
        "firestore_configured": firestore_client is not None
    }

@app.get("/api/test")
async def test_endpoint():
    """Simple test endpoint"""
    return {"message": "Backend is working!", "timestamp": "2024-01-01"}

@app.post("/api/stripe/webhook")
async def stripe_webhook(request: Request):
    """
    Secure Stripe webhook endpoint with signature verification
    """
    try:
        # Get the webhook signing secret from environment
        webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
        if not webhook_secret:
            raise HTTPException(
                status_code=500, 
                detail="STRIPE_WEBHOOK_SECRET not configured"
            )
        
        # Get the raw body and signature header
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        
        if not sig_header:
            raise HTTPException(
                status_code=400, 
                detail="Missing stripe-signature header"
            )
        
        # Verify the webhook signature
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except ValueError:
            # Invalid payload
            raise HTTPException(status_code=400, detail="Invalid payload")
        except stripe.error.SignatureVerificationError:
            # Invalid signature
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        # Handle the event
        if event["type"] == "payment_intent.succeeded":
            payment_intent = event["data"]["object"]
            await handle_payment_success(payment_intent)
            
        elif event["type"] == "payment_intent.payment_failed":
            payment_intent = event["data"]["object"]
            await handle_payment_failure(payment_intent)
            
        elif event["type"] == "account.updated":
            account = event["data"]["object"]
            await handle_account_update(account)
            
        else:
            print(f"Unhandled event type: {event['type']}")
        
        return Response(status_code=200)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error processing webhook: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Webhook processing failed")

async def handle_payment_success(payment_intent):
    """Handle successful payment"""
    try:
        if not firestore_client:
            print("Firestore not configured, skipping payment success handling")
            return
            
        # Extract metadata
        metadata = payment_intent.get("metadata", {})
        quiz_id = metadata.get("quiz_id")
        user_id = metadata.get("user_id")
        creator_stripe_account_id = metadata.get("creator_stripe_account_id")
        
        if not all([quiz_id, user_id, creator_stripe_account_id]):
            print(f"Missing metadata in payment intent: {payment_intent['id']}")
            return
        
        # Record the successful payment in Firestore
        payment_record = {
            "payment_intent_id": payment_intent["id"],
            "amount": payment_intent["amount"],
            "currency": payment_intent["currency"],
            "quiz_id": quiz_id,
            "user_id": user_id,
            "creator_stripe_account_id": creator_stripe_account_id,
            "status": "succeeded",
            "created_at": SERVER_TIMESTAMP,
            "stripe_created": payment_intent["created"]
        }
        
        # Add to payments collection
        payments_ref = firestore_client.collection("payments")
        payments_ref.add(payment_record)
        
        # Grant access to the quiz answers
        user_access_ref = firestore_client.collection("user_quiz_access").document(f"{user_id}_{quiz_id}")
        user_access_ref.set({
            "user_id": user_id,
            "quiz_id": quiz_id,
            "payment_intent_id": payment_intent["id"],
            "access_granted_at": SERVER_TIMESTAMP,
            "amount_paid": payment_intent["amount"]
        })
        
        print(f"[SECURITY LOG] Payment success handled - User: {user_id}, Quiz: {quiz_id}, Amount: {payment_intent['amount']}, PaymentIntent: {payment_intent['id']}")
        
        # Track payment for security monitoring
        security_alerts.track_payment_attempt(user_id, payment_intent['amount'], "unknown_ip")
        
    except Exception as e:
        print(f"Error handling payment success: {str(e)}")
        traceback.print_exc()

async def handle_payment_failure(payment_intent):
    """Handle failed payment"""
    try:
        if not firestore_client:
            print("Firestore not configured, skipping payment failure handling")
            return
            
        # Extract metadata
        metadata = payment_intent.get("metadata", {})
        quiz_id = metadata.get("quiz_id")
        user_id = metadata.get("user_id")
        
        # Record the failed payment
        payment_record = {
            "payment_intent_id": payment_intent["id"],
            "amount": payment_intent["amount"],
            "currency": payment_intent["currency"],
            "quiz_id": quiz_id,
            "user_id": user_id,
            "status": "failed",
            "failure_reason": payment_intent.get("last_payment_error", {}).get("message", "Unknown"),
            "created_at": SERVER_TIMESTAMP,
            "stripe_created": payment_intent["created"]
        }
        
        payments_ref = firestore_client.collection("payments")
        payments_ref.add(payment_record)
        
        failure_reason = payment_intent.get('last_payment_error', {}).get('message', 'Unknown')
        print(f"[SECURITY LOG] Payment failure handled - User: {user_id}, Quiz: {quiz_id}, Reason: {failure_reason}, PaymentIntent: {payment_intent['id']}")
        
        # Track failed payment for security alerts
        security_alerts.track_failed_payment(user_id, "unknown_ip", failure_reason)
        
    except Exception as e:
        print(f"Error handling payment failure: {str(e)}")
        traceback.print_exc()

async def handle_account_update(account):
    """Handle Stripe Connect account updates"""
    try:
        if not firestore_client:
            print("Firestore not configured, skipping account update handling")
            return
            
        account_id = account["id"]
        
        # Update user's Stripe account status in Firestore
        users_ref = firestore_client.collection("users")
        query = users_ref.where("stripeAccountId", "==", account_id).limit(1)
        docs = query.get()
        
        for doc in docs:
            doc.reference.update({
                "stripeAccountStatus": account.get("details_submitted", False),
                "stripeChargesEnabled": account.get("charges_enabled", False),
                "stripePayoutsEnabled": account.get("payouts_enabled", False),
                "updated_at": SERVER_TIMESTAMP
            })
            print(f"Updated Stripe account status for account {account_id}")
        
    except Exception as e:
        print(f"Error handling account update: {str(e)}")
        traceback.print_exc()

@app.get("/api/quiz/{quiz_id}/access")
async def check_quiz_access(quiz_id: str, http_request: Request):
    """
    Check if user has paid access to quiz answers
    Only grants access if payment was verified via webhook
    """
    try:
        if not firestore_client:
            raise HTTPException(status_code=500, detail="Firebase Admin not configured")
        
        # Verify user authentication
        decoded = require_firebase_user(http_request)
        user_id = decoded.get("uid")
        
        # Check if user has verified payment access
        access_ref = firestore_client.collection("user_quiz_access").document(f"{user_id}_{quiz_id}")
        access_doc = access_ref.get()
        
        if not access_doc.exists:
            return {
                "has_access": False,
                "message": "Payment required to access quiz answers"
            }
        
        access_data = access_doc.to_dict()
        return {
            "has_access": True,
            "payment_verified": True,
            "access_granted_at": access_data.get("access_granted_at"),
            "amount_paid": access_data.get("amount_paid")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error checking quiz access: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error checking access")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
