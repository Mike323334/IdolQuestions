import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
} from '@mui/material';
import {
  Quiz as QuizIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import PaymentDialog from '../components/PaymentDialog';
import { getAllQuizzes } from '../services/quizzes';
// TODO: Implement transaction logging

interface Quiz {
  id: string;
  title: string;
  creatorId: string;
  creatorName: string;
  creatorMerchantId?: string;
  creatorStripeAccountId?: string;
  questions: { text: string; options: string[]; correct: number; type: string }[];
  answerPrice: number;
  isOnboarding?: boolean;
}

const BrowseQuizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<{ [quizId: string]: { fanAnswers?: { [fanName: string]: number[] }; purchased?: { [fanName: string]: boolean } } }>({});
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedQuizForPayment, setSelectedQuizForPayment] = useState<{ quizId: string; quiz: Quiz } | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    let isActive = true;
    const loadQuizzes = async () => {
      const storedAnswers = JSON.parse(localStorage.getItem('quizAnswers') || '{}');
      try {
        const storedQuizzes = await getAllQuizzes();
        const availableQuizzes = storedQuizzes
          .filter((q) => !q.isOnboarding && q.creatorId !== user?.id)
          .map((q) => {
            return {
              ...q,
              answerPrice: q.answerPrice ?? 0,
            };
          });
        if (isActive) {
          setQuizzes(availableQuizzes);
          setAnswers(storedAnswers);
        }
      } catch (loadError) {
        console.error('Failed to load quizzes:', loadError);
        if (isActive) {
          setQuizzes([]);
          setAnswers(storedAnswers);
        }
      }
    };

    loadQuizzes();
    return () => {
      isActive = false;
    };
  }, [user]);

  const handleTakeQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
  };

  const handleCloseQuizDialog = () => {
    setSelectedQuiz(null);
  };

  const handlePaymentClick = (quiz: Quiz) => {
    setSelectedQuizForPayment({ quizId: quiz.id, quiz });
    setPaymentDialogOpen(true);
  };

  const handlePaymentConfirm = () => {
    if (selectedQuizForPayment) {
      // Mark answers as purchased for this user
      const quizAnswers = JSON.parse(localStorage.getItem('quizAnswers') || '{}');
      if (!quizAnswers[selectedQuizForPayment.quizId]) {
        quizAnswers[selectedQuizForPayment.quizId] = { fanAnswers: {} };
      }
      if (!quizAnswers[selectedQuizForPayment.quizId].purchased) {
        quizAnswers[selectedQuizForPayment.quizId].purchased = {};
      }
      quizAnswers[selectedQuizForPayment.quizId].purchased[user?.username || ''] = true;
      localStorage.setItem('quizAnswers', JSON.stringify(quizAnswers));
      setAnswers(quizAnswers);
    }
  };

  const hasPurchasedAnswers = (quizId: string) => {
    return answers[quizId]?.purchased?.[user?.username || ''] === true;
  };

  const getQuizAnswers = (quiz: Quiz) => {
    const quizAnswers = answers[quiz.id];
    if (!quizAnswers || !hasPurchasedAnswers(quiz.id)) return null;

    return quiz.questions.map(q => q.correct);
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom align="center" sx={{ mb: 4 }}>
          Explorar Cuestionarios
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {quizzes.map((quiz) => (
            <Card
              key={quiz.id}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <QuizIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {quiz.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {quiz.creatorName}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {quiz.questions.length} preguntas
                </Typography>

                {hasPurchasedAnswers(quiz.id) ? (
                  <Chip
                    icon={<VisibilityIcon />}
                    label="Respuestas Desbloqueadas"
                    color="success"
                    variant="outlined"
                  />
                ) : (
                  <Chip
                    icon={<LockIcon />}
                    label={`Precio: $${quiz.answerPrice}`}
                    color="primary"
                    variant="outlined"
                  />
                )}
              </CardContent>

              <CardActions>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleTakeQuiz(quiz)}
                  sx={{ mr: 1 }}
                >
                  Tomar Cuestionario
                </Button>
                {!hasPurchasedAnswers(quiz.id) && quiz.creatorStripeAccountId && user?.role === 'Follower' && (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handlePaymentClick(quiz)}
                    startIcon={<LockIcon />}
                  >
                    Comprar Respuestas
                  </Button>
                )}
              </CardActions>
            </Card>
          ))}
        </Box>

        {quizzes.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <QuizIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No hay cuestionarios disponibles
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Los creadores aún no han publicado cuestionarios.
            </Typography>
          </Box>
        )}

        {/* Quiz Taking Dialog */}
        <Dialog
          open={!!selectedQuiz}
          onClose={handleCloseQuizDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight={600}>
              {selectedQuiz?.title}
            </Typography>
          </DialogTitle>
          <DialogContent>
            {selectedQuiz && (
              <Stack spacing={3}>
                {selectedQuiz.questions.map((q, qIndex) => (
                  <Box key={qIndex}>
                    <Typography variant="h6" gutterBottom>
                      {q.text}
                    </Typography>
                    <RadioGroup>
                      {q.options.map((opt, oIndex) => (
                        <FormControlLabel
                          key={oIndex}
                          value={oIndex}
                          control={<Radio />}
                          label={opt}
                          disabled
                        />
                      ))}
                    </RadioGroup>
                    {hasPurchasedAnswers(selectedQuiz.id) && (
                      <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                        ✓ Respuesta correcta: {q.options[q.correct]}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseQuizDialog} variant="contained">
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Payment Dialog */}
        {selectedQuizForPayment && user && selectedQuizForPayment.quiz.creatorStripeAccountId && (
          <PaymentDialog
            open={paymentDialogOpen}
            onClose={() => {
              setPaymentDialogOpen(false);
              setSelectedQuizForPayment(null);
            }}
            onConfirm={handlePaymentConfirm}
            price={selectedQuizForPayment.quiz.answerPrice}
            quizTitle={selectedQuizForPayment.quiz.title}
            creatorName={selectedQuizForPayment.quiz.creatorName}
            quizId={selectedQuizForPayment.quizId}
            userId={user.id}
            creatorStripeAccountId={selectedQuizForPayment.quiz.creatorStripeAccountId}
          />
        )}
      </Container>
    </Layout>
  );
};

export default BrowseQuizzes;
