import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Box,
  Paper,
  Card,
  CardContent,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import Layout from './components/Layout/Layout';
import { useAuth } from './contexts/AuthContext';
import { getQuizById, markQuizCreatorTaken } from './services/quizzes';

const QuizTaker = () => {
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get('quizId');
  const [quiz, setQuiz] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [answers, setAnswers] = useState({});
  const [userName, setUserName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    let isActive = true;
    const loadQuiz = async () => {
      if (!quizId) {
        setQuiz(null);
        setLoadError('');
        return;
      }
      const isNumericId = /^[0-9]+$/.test(quizId);
      if (isNumericId) {
        const localQuizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
        const localQuiz = localQuizzes[parseInt(quizId, 10)];
        if (localQuiz) {
          if (isActive) {
            setLoadError('');
            setQuiz(localQuiz);
          }
          return;
        }
      }
      try {
        const quizData = await getQuizById(quizId);
        if (isActive) {
          if (!quizData) {
            setQuiz(null);
            setLoadError('Quiz not found.');
            return;
          }
          setLoadError('');
          setQuiz(quizData);
        }
      } catch (loadError) {
        console.error('Failed to load quiz:', loadError);
        if (isActive) {
          setQuiz(null);
          setLoadError('Failed to load quiz.');
        }
      }
    };

    loadQuiz();

    if (user) {
      setUserName(user.username);
    }

    return () => {
      isActive = false;
    };
  }, [quizId, user]);

  const handleAnswerChange = (qIndex, answer) => {
    setAnswers({ ...answers, [qIndex]: answer });
  };

  const submitQuiz = async () => {
    if (!userName.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (!quiz || !quizId) {
      alert('Quiz not available.');
      return;
    }
    const questionCount = quiz.questions.length;
    const users = JSON.parse(localStorage.getItem('users')) || {};
    users[userName] = (users[userName] || 0) + questionCount;
    localStorage.setItem('users', JSON.stringify(users));

    // Store answers based on user type
    const quizAnswers = JSON.parse(localStorage.getItem('quizAnswers')) || {};
    if (!quizAnswers[quizId]) {
      quizAnswers[quizId] = {};
    }
    if (user && quiz.creatorId === user.id) {
      // Creator's answers
      quizAnswers[quizId].creatorAnswers = answers;
      quizAnswers[quizId].creatorName = userName;
      if (!quiz.isOnboarding) {
        try {
          await markQuizCreatorTaken(quizId);
        } catch (markError) {
          console.error('Failed to mark creator taken:', markError);
        }
      }
    } else {
      // Fan's answers
      if (!quizAnswers[quizId].fanAnswers) {
        quizAnswers[quizId].fanAnswers = {};
      }
      quizAnswers[quizId].fanAnswers[userName] = answers;
    }
    localStorage.setItem('quizAnswers', JSON.stringify(quizAnswers));

    setSubmitted(true);
    setTimeout(() => navigate('/results'), 2000);
  };

  if (loadError) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h6" align="center">
            {loadError}
          </Typography>
        </Container>
      </Layout>
    );
  }

  if (!quiz) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h6" align="center">
            Cargando cuestionario...
          </Typography>
        </Container>
      </Layout>
    );
  }



  const handleCloseDialog = () => {
    navigate('/results');
  };

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography
          variant="h3"
          align="center"
          fontWeight={700}
          gutterBottom
          sx={{ mb: 4 }}
        >
          {quiz.title}
        </Typography>

        <Paper sx={{ p: 3, mb: 4, backgroundColor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom>
            Ingresa Tu Nombre
          </Typography>
          <TextField
            fullWidth
            placeholder="Tu nombre"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            variant="outlined"
          />
        </Paper>

        <Stack spacing={3}>
          {quiz.questions.map((q, qIndex) => (
            <Card key={qIndex} sx={{ backgroundColor: 'background.paper' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip
                    label={q.category}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={q.label}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Pregunta {qIndex + 1}
                  </Typography>
                </Box>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  {q.text}
                </Typography>
                <Box sx={{ backgroundColor: 'primary.light', p: 1, borderRadius: 1, mb: 2 }}>
                  <Typography variant="body2" color="primary.contrastText" fontWeight={500}>
                    Responde como piensas que responderia tu idolo o creador de contenido.
                  </Typography>
                </Box>
                <RadioGroup
                  value={answers[qIndex] ?? -1}
                  onChange={(e) => handleAnswerChange(qIndex, parseInt(e.target.value))}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr', lg: '1fr 1fr' },
                    gap: { xs: 1, sm: 1.5 },
                    width: '100%',
                  }}
                >
                  {q.options.map((opt, oIndex) => (
                    <FormControlLabel
                      key={oIndex}
                      value={oIndex}
                      control={<Radio />}
                      label={opt}
                      sx={{
                        m: 0,
                        width: '100%',
                        alignItems: 'flex-start',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        px: { xs: 1, sm: 1.5 },
                        py: { xs: 0.75, sm: 1 },
                        '& .MuiFormControlLabel-label': {
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          lineHeight: 1.4,
                          overflowWrap: 'break-word',
                          hyphens: 'auto',
                          display: 'block',
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          padding: '4px 0',
                        },
                        '& .MuiRadio-root': {
                          padding: { xs: '4px', sm: '9px' },
                          alignSelf: 'flex-start',
                          marginTop: '2px',
                        },
                        minHeight: { xs: '50px', sm: '60px' },
                        height: 'auto',
                      }}
                    />
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={submitQuiz}
            sx={{ px: 4 }}
          >
            Enviar Cuestionario
          </Button>
        </Box>

        <Dialog open={submitted} onClose={handleCloseDialog}>
          <DialogTitle>¡Cuestionario Completado!</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              ¡Felicidades, {userName}! Has completado el cuestionario exitosamente.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} variant="contained">
              Ver Resultados
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default QuizTaker;
