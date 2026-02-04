# Quiz Questions Generator Backend

Backend API para generar preguntas interesantes usando Groq AI que ayudan a los creadores de contenido a crear cuestionarios atractivos.

## Configuración

1. Instala las dependencias:
```bash
pip install -r requirements.txt
```

2. Configura tu API key de Groq:
```bash
cp .env.example .env
# Edita .env y agrega tu GROQ_API_KEY
```

Puedes obtener tu API key en: https://console.groq.com/

3. Ejecuta el servidor:
```bash
python main.py
```

O con uvicorn directamente:
```bash
uvicorn main:app --reload --port 8000
```

## Endpoints

### POST /api/generate-questions

Genera preguntas interesantes para un creador de contenido.

**Request Body:**
```json
{
  "creator_name": "Nombre del Creador",
  "creator_niche": "fitness",
  "creator_bio": "Creador de contenido sobre fitness y salud",
  "number_of_questions": 5,
  "question_type": "engaging",
  "target_audience": "fans"
}
```

**Response:**
```json
{
  "questions": [
    {
      "text": "¿Cuál es tu ritual secreto antes de cada entrenamiento?",
      "options": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
      "category": "Preguntas Generales",
      "label": "Rutina Pre-Entrenamiento",
      "explanation": "Los fans quieren conocer los hábitos secretos..."
    }
  ],
  "success": true,
  "message": "Successfully generated 5 engaging questions"
}
```

### GET /api/health

Verifica el estado del servidor y la configuración de Groq.

## Variables de Entorno

- `GROQ_API_KEY`: Tu API key de Groq (requerido)
