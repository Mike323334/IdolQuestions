# Configuración del Proyecto

## Backend (Python)

### 1. Instalar dependencias

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la carpeta `backend/`:

```env
GROQ_API_KEY=tu_groq_api_key_aqui
STRIPE_SECRET_KEY=sk_test_tu_stripe_secret_key_aqui
```

**Obtener API Keys:**
- **Groq API Key**: https://console.groq.com/
- **Stripe Secret Key**: https://dashboard.stripe.com/apikeys

### 3. Ejecutar el servidor

```bash
python main.py
```

O con uvicorn:

```bash
uvicorn main:app --reload --port 8000
```

El servidor estará disponible en `http://localhost:8000`

## Frontend (React)

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la carpeta `frontend/`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu_stripe_publishable_key_aqui
VITE_API_URL=http://localhost:8000
```

**Nota**: Vite usa el prefijo `VITE_` en lugar de `REACT_APP_` para las variables de entorno.

**Obtener Stripe Publishable Key**: https://dashboard.stripe.com/apikeys

### 3. Ejecutar la aplicación

```bash
cd frontend
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## Funcionalidades

### 1. Generación de Preguntas con IA (Groq)

Los creadores de contenido pueden usar Groq AI para generar preguntas interesantes:

- Accede a "Crear Cuestionario"
- Usa el componente "Generar Preguntas con IA"
- Proporciona información sobre tu nicho y bio
- Selecciona el tipo y número de preguntas
- La IA generará preguntas atractivas que harán que los fans quieran pagar por las respuestas

### 2. Pagos con Stripe

Los seguidores pueden pagar para desbloquear las respuestas de los creadores:

- Cuando un creador establece un precio para sus respuestas
- Los seguidores verán un botón "Pagar $X para Desbloquear"
- Se abre un diálogo de pago con Stripe
- Después del pago exitoso, las respuestas se desbloquean

## Endpoints del Backend

### POST /api/generate-questions
Genera preguntas usando Groq AI

**Request:**
```json
{
  "creator_name": "Nombre del Creador",
  "creator_niche": "fitness",
  "creator_bio": "Creador de contenido sobre fitness",
  "number_of_questions": 5,
  "question_type": "engaging",
  "target_audience": "fans"
}
```

### POST /api/create-payment-intent
Crea un Payment Intent de Stripe

**Request:**
```json
{
  "amount": 1000,
  "currency": "usd",
  "quiz_id": 1,
  "user_id": "user123",
  "quiz_title": "Mi Cuestionario",
  "creator_name": "Creador"
}
```

### GET /api/health
Verifica el estado del servidor

## Notas Importantes

1. **Groq API**: Necesitas una cuenta en Groq y una API key. El modelo usado es `llama-3.1-70b-versatile` que es rápido y efectivo.

2. **Stripe**: Usa las claves de prueba (test keys) para desarrollo. En producción, cambia a las claves live.

3. **CORS**: El backend está configurado para aceptar requests desde `localhost:3000` y `localhost:3001`. Ajusta según necesites.

4. **Seguridad**: En producción, asegúrate de:
   - Validar todos los inputs
   - Implementar autenticación adecuada
   - Usar HTTPS
   - Validar pagos en el backend antes de desbloquear contenido
