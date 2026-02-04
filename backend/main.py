from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
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
import firebase_admin
from firebase_admin import credentials, auth as admin_auth, firestore

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
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
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
- options: 4 opciones de respuesta (una debe ser la correcta según el creador)
- category: Categoría (ej: "Preguntas Generales", "Preguntas Personales", "Preguntas Divertidas")
- label: Etiqueta descriptiva (ej: "Rutina Diaria", "Gustos Personales", "Secretos Revelados")
- explanation: Por qué esta pregunta es interesante para los fans

Formato JSON esperado:
{{
  "questions": [
    {{
      "text": "¿Cuál es el ritual secreto que haces antes de cada grabación?",
      "options": ["Tomar 3 sorbos de agua", "Bailar 30 segundos", "Revisar el espejo 5 veces", "Escuchar tu canción favorita"],
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
        
        questions = []
        for q in response_data.get("questions", []):
            questions.append(GeneratedQuestion(
                text=q.get("text", ""),
                options=q.get("options", []),
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
) -> List[str]:
    context = f"""
Eres un experto en crear opciones de respuesta para preguntas de cuestionarios.

Pregunta: {question_text}
Creador: {creator_name or "No especificado"}
Nicho: {niche or "general"}
Bio: {bio or "No proporcionada"}

Genera 4 opciones de respuesta plausibles y variadas. Responde en formato JSON:
{{
  "options": ["Opcion 1", "Opcion 2", "Opcion 3", "Opcion 4"]
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
        return [str(opt) for opt in options][:4]

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
    Confirm payment and unlock quiz answers
    """
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if intent.status == "succeeded":
            # Payment successful - unlock answers
            return {
                "success": True,
                "message": "Payment confirmed",
                "quiz_id": intent.metadata.get("quiz_id"),
                "user_id": intent.metadata.get("user_id"),
            }
        else:
            return {
                "success": False,
                "message": f"Payment status: {intent.status}",
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
            refresh_url="http://localhost:3000/settings?stripe=refresh",
            return_url="http://localhost:3000/settings?stripe=success",
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

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "groq_configured": bool(os.getenv("GROQ_API_KEY")),
        "stripe_configured": bool(os.getenv("STRIPE_SECRET_KEY"))
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
