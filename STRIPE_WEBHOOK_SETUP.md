# Configuración de Webhooks Seguros de Stripe

## ✅ Implementación Completada

Se ha implementado un sistema seguro de webhooks de Stripe que valida las firmas usando el Signing Secret.

## 🔧 Configuración Requerida

### 1. Variables de Entorno

Agrega estas variables a tu archivo `.env` del backend:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Configurar Webhook en Stripe Dashboard

1. **Ir a Stripe Dashboard** → Developers → Webhooks
2. **Crear nuevo endpoint** con URL: `https://tu-backend.onrender.com/api/stripe/webhook`
3. **Seleccionar eventos**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated`
4. **Copiar Signing Secret** y agregarlo a `STRIPE_WEBHOOK_SECRET`

### 3. Eventos Manejados

#### `payment_intent.succeeded`
- ✅ Registra el pago exitoso en Firestore
- ✅ Otorga acceso verificado al quiz
- ✅ Crea registro en `user_quiz_access` collection

#### `payment_intent.payment_failed`
- ✅ Registra el pago fallido
- ✅ Guarda razón del fallo para debugging

#### `account.updated`
- ✅ Actualiza estado de cuentas Stripe Connect
- ✅ Sincroniza capacidades de pago

## 🔒 Características de Seguridad

### ✅ Validación de Firma
```python
# Verifica que el webhook viene realmente de Stripe
event = stripe.Webhook.construct_event(
    payload, sig_header, webhook_secret
)
```

### ✅ Acceso Solo por Webhook
- Los pagos solo se confirman via webhook verificado
- El endpoint `/api/confirm-payment` es DEPRECATED
- Usar `/api/quiz/{quiz_id}/access` para verificar acceso

### ✅ Colecciones Firestore Seguras

#### `payments` Collection
```json
{
  "payment_intent_id": "pi_...",
  "amount": 1000,
  "currency": "usd",
  "quiz_id": "quiz123",
  "user_id": "user456",
  "status": "succeeded",
  "created_at": "timestamp",
  "stripe_created": 1234567890
}
```

#### `user_quiz_access` Collection
```json
{
  "user_id": "user456",
  "quiz_id": "quiz123",
  "payment_intent_id": "pi_...",
  "access_granted_at": "timestamp",
  "amount_paid": 1000
}
```

## 🚀 Uso en Frontend

### Verificar Acceso a Quiz
```typescript
import { checkQuizAccess } from '../services/api';

const access = await checkQuizAccess(quizId);
if (access.has_access && access.payment_verified) {
  // Usuario tiene acceso verificado
  showQuizAnswers();
} else {
  // Requiere pago
  showPaymentDialog();
}
```

## ⚠️ Importante

1. **NUNCA procesar pagos sin verificar webhook**
2. **SIEMPRE validar firma del webhook**
3. **Solo otorgar acceso después de webhook verificado**
4. **Configurar HTTPS en producción** (requerido por Stripe)

## 🧪 Testing

### Stripe CLI para Testing Local
```bash
# Instalar Stripe CLI
# Reenviar webhooks a localhost
stripe listen --forward-to localhost:8000/api/stripe/webhook

# Obtener webhook secret para testing
stripe listen --print-secret
```

### Webhooks de Prueba
```bash
# Simular pago exitoso
stripe trigger payment_intent.succeeded

# Simular pago fallido  
stripe trigger payment_intent.payment_failed
```

## 📋 Checklist de Seguridad

- ✅ Webhook secret configurado
- ✅ Validación de firma implementada
- ✅ HTTPS configurado en producción
- ✅ Acceso solo por webhook verificado
- ✅ Logging de eventos para debugging
- ✅ Manejo de errores robusto
- ✅ Metadata de pagos preservada

El sistema ahora es **completamente seguro** y sigue las mejores prácticas de Stripe para webhooks.