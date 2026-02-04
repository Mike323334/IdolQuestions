import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { auth } from '../services/firebase';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  price: number;
  quizTitle: string;
  creatorName: string;
  quizId: string;
  userId: string;
  creatorStripeAccountId: string;
}

// Payment Form Component
const PaymentForm: React.FC<{
  price: number;
  quizTitle: string;
  creatorName: string;
  quizId: string;
  userId: string;
  creatorStripeAccountId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}> = ({ price, quizTitle, creatorName, quizId, userId, creatorStripeAccountId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        setError('Debes iniciar sesión para pagar.');
        setProcessing(false);
        return;
      }
      // Create payment intent on backend
      const response = await fetch('http://localhost:8000/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: price * 100, // Convert to cents
          currency: 'usd',
          quiz_id: quizId,
          user_id: userId,
          quiz_title: quizTitle,
          creator_name: creatorName,
          creator_stripe_account_id: creatorStripeAccountId,
        }),
      });

      const { client_secret, error: backendError } = await response.json();

      if (backendError) {
        setError(backendError);
        setProcessing(false);
        return;
      }

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError('Card element not found');
        setProcessing(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        client_secret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Box
          sx={{
            p: 2,
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={!stripe || processing}
          startIcon={processing ? <CircularProgress size={20} /> : <UnlockIcon />}
          sx={{
            py: 1.5,
            fontWeight: 600,
            boxShadow: '0 8px 24px -6px rgba(99, 102, 241, 0.4)',
          }}
        >
          {processing ? 'Procesando Pago...' : `Pagar $${price} con Stripe`}
        </Button>
      </Stack>
    </form>
  );
};

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onClose,
  onConfirm,
  price,
  quizTitle,
  creatorName,
  quizId,
  userId,
  creatorStripeAccountId,
}) => {
  const [success, setSuccess] = useState(false);

  const handlePaymentSuccess = () => {
    setSuccess(true);
    setTimeout(() => {
      onConfirm();
      setSuccess(false);
      onClose();
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LockIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Desbloquear Respuestas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {quizTitle}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              ¡Pago Exitoso!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Las respuestas han sido desbloqueadas
            </Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            <Alert severity="info" sx={{ borderRadius: '12px' }}>
              Estás a punto de pagar para ver las respuestas del creador de contenido.
            </Alert>

            <Box
              sx={{
                p: 3,
                borderRadius: '12px',
                border: '2px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
              }}
            >
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Creador
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {creatorName}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Cuestionario
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {quizTitle}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Precio
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="h5" fontWeight={700} className="text-gradient">
                      ${price}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: '8px',
                backgroundColor: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid',
                borderColor: 'rgba(99, 102, 241, 0.2)',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                💳 Pago seguro procesado por Stripe. Tu información de pago está protegida.
              </Typography>
            </Box>

            <Elements stripe={stripePromise}>
              <PaymentForm
                price={price}
                quizTitle={quizTitle}
                creatorName={creatorName}
                quizId={quizId}
                userId={userId}
                creatorStripeAccountId={creatorStripeAccountId}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          </Stack>
        )}
      </DialogContent>

      {!success && (
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={onClose} variant="outlined" sx={{ borderWidth: 2 }}>
            Cancelar
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default PaymentDialog;
