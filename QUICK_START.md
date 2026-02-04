# Guía Rápida de Configuración

## 🔑 Obtener API Keys de Stripe

### Paso 1: Acceder a Stripe Dashboard
1. Ve a: https://dashboard.stripe.com/login
2. Inicia sesión en tu cuenta

### Paso 2: Encontrar las API Keys
1. En el menú lateral izquierdo, busca **"Developers"** (al final del menú)
2. Haz clic en **"Developers"** → **"API keys"**
   - O ve directamente a: https://dashboard.stripe.com/test/apikeys

### Paso 3: Copiar las Keys
En la página de API keys verás:

**Publishable key** (para el frontend):
- Se ve como: `pk_test_51...` o `pk_live_51...`
- Esta es la key pública, segura para usar en el frontend

**Secret key** (para el backend):
- Se ve como: `sk_test_51...` o `sk_live_51...`
- ⚠️ **NUNCA** compartas esta key públicamente
- Solo úsala en el backend

### Paso 4: Configurar en el Proyecto

#### Frontend (.env en la carpeta frontend/):
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu_publishable_key_aqui
VITE_API_URL=http://localhost:8000
```

**Nota**: Vite usa el prefijo `VITE_` en lugar de `REACT_APP_` para las variables de entorno.

#### Backend (.env en la carpeta backend/):
```env
GROQ_API_KEY=tu_groq_api_key_aqui
STRIPE_SECRET_KEY=sk_test_tu_secret_key_aqui
```

## 🤖 Obtener API Key de Groq

1. Ve a: https://console.groq.com/
2. Inicia sesión o crea una cuenta
3. Ve a **"API Keys"** en el menú
4. Crea una nueva API key o copia una existente
5. Agrégala al archivo `.env` del backend como `GROQ_API_KEY`

## ✅ Verificar Configuración

### Backend:
```bash
cd backend
python main.py
```

Deberías ver: `Uvicorn running on http://0.0.0.0:8000`

### Frontend:
```bash
npm start
```

Deberías ver la app en: `http://localhost:3000`

## 🔍 Verificar que las Keys Funcionan

### Backend Health Check:
Visita: http://localhost:8000/api/health

Deberías ver:
```json
{
  "status": "healthy",
  "groq_configured": true,
  "stripe_configured": true
}
```

Si alguna dice `false`, verifica que agregaste la key correcta en el `.env` del backend.

## 📝 Notas Importantes

- **Test Mode**: Usa las keys que empiezan con `pk_test_` y `sk_test_` para desarrollo
- **Live Mode**: Solo cambia a `pk_live_` y `sk_live_` cuando estés listo para producción
- **Seguridad**: Nunca subas tus `.env` a Git. Ya están en `.gitignore`
