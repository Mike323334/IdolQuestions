# Threads Quiz App

Aplicación de cuestionarios donde los creadores de contenido pueden crear preguntas interesantes usando IA (Groq) y los seguidores pueden pagar para desbloquear las respuestas usando Stripe.

## 📁 Estructura del Proyecto

```
threads-quiz-app/
├── frontend/          # Aplicación React (Frontend)
│   ├── src/          # Código fuente React
│   ├── public/       # Archivos públicos
│   ├── package.json  # Dependencias del frontend
│   └── .env          # Variables de entorno del frontend
│
├── backend/          # API Python con FastAPI (Backend)
│   ├── main.py       # Servidor FastAPI
│   ├── requirements.txt  # Dependencias Python
│   └── .env          # Variables de entorno del backend
│
└── README.md         # Este archivo
```

## 🚀 Inicio Rápido

### Backend

```bash
cd backend
pip install -r requirements.txt
# Configura .env con GROQ_API_KEY y STRIPE_SECRET_KEY
python main.py
```

### Frontend

```bash
cd frontend
npm install
# Configura .env con REACT_APP_STRIPE_PUBLISHABLE_KEY
npm start
```

## 📚 Documentación

- **QUICK_START.md** - Guía rápida para configurar API keys
- **SETUP.md** - Instrucciones detalladas de configuración
- **backend/README.md** - Documentación del backend API

## 🔑 API Keys Necesarias

1. **Groq API Key** - Para generación de preguntas con IA
   - Obtener en: https://console.groq.com/

2. **Stripe Keys** - Para procesamiento de pagos
   - Publishable Key (frontend): https://dashboard.stripe.com/test/apikeys
   - Secret Key (backend): https://dashboard.stripe.com/test/apikeys

## 🛠️ Tecnologías

### Frontend
- React 19
- TypeScript
- Material-UI
- Stripe React

### Backend
- Python 3.8+
- FastAPI
- Groq AI
- Stripe Python SDK

## 📝 Notas

- El backend corre en `http://localhost:8000`
- El frontend corre en `http://localhost:3000`
- Usa las test keys de Stripe para desarrollo
# IdolQuestions
