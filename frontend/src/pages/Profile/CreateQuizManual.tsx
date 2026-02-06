import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  Stack,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import PriceSelector from '../../components/PriceSelector';
import { createQuiz } from '../../services/quizzes';
import AIGeneratedQuestions from '../../components/AIGeneratedQuestions';
import { generateQuestionOptions } from '../../services/api';
import { mergeOptions } from '../../utils/quizOptions';

interface Question {
  text: string;
  options: string[];
  correct: number;
}

const CreateQuizManual: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [titleDialogOpen, setTitleDialogOpen] = useState(false);
  const [answerPrice, setAnswerPrice] = useState<number | null>(null);
  const [optionLoading, setOptionLoading] = useState<Record<number, boolean>>({});
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: Array(8).fill(''), correct: 0 }]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleAiQuestions = async (aiQuestions: { text: string; options: string[] }[]) => {
    setError('');
    const normalized = await Promise.all(
      aiQuestions.map(async (q) => {
        const baseOptions = q.options || [];
        let options = mergeOptions(baseOptions, []);

        if (options.length < 8) {
          try {
            const response = await generateQuestionOptions({
              question_text: q.text,
              creator_name: user?.username,
              existing_options: baseOptions,
              target_count: 8,
            });
            if (response.success && response.options?.length) {
              options = mergeOptions(baseOptions, response.options);
            }
          } catch (genError) {
            console.error('Failed to expand AI options:', genError);
          }
        }

        if (options.length < 8) {
          setSnackbar({
            message: 'No se pudieron generar 8 opciones para algunas preguntas. Usa "Generar opciones con IA".',
            severity: 'error',
          });
        }

        return {
          text: q.text,
          options: options.length ? options : Array(8).fill(''),
          correct: 0,
        };
      })
    );

    setQuestions((prev) => [...prev, ...normalized]);
  };

  const handleGenerateOptions = async (qIndex: number) => {
    const questionText = questions[qIndex]?.text?.trim();
    if (!questionText) {
      setError('Agrega el texto de la pregunta antes de generar opciones.');
      setSnackbar({ message: 'Agrega el texto de la pregunta antes de generar opciones.', severity: 'error' });
      return;
    }
    setError('');
    setOptionLoading((prev) => ({ ...prev, [qIndex]: true }));
    try {
      const response = await generateQuestionOptions({
        question_text: questionText,
        creator_name: user?.username,
        existing_options: questions[qIndex]?.options,
        target_count: 8,
      });
      if (!response.success || !response.options?.length) {
        setError(response.message || 'No se pudieron generar opciones.');
        setSnackbar({ message: response.message || 'No se pudieron generar opciones.', severity: 'error' });
        return;
      }
      const updated = [...questions];
      const options = mergeOptions(questions[qIndex]?.options || [], response.options || []);
      if (options.length < 8) {
        const message = 'No se pudieron generar 8 opciones. Intenta nuevamente.';
        setError(message);
        setSnackbar({ message, severity: 'error' });
        return;
      }
      updated[qIndex] = { ...updated[qIndex], options };
      setQuestions(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al generar opciones.';
      setError(message);
      setSnackbar({ message, severity: 'error' });
    } finally {
      setOptionLoading((prev) => ({ ...prev, [qIndex]: false }));
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleTitleDialogClose = () => {
    setTitleDialogOpen(false);
  };

  const saveQuiz = async () => {
    setError('');
    setSuccess('');

    if (!quizTitle.trim()) {
      setTitleDialogOpen(true);
      return;
    }

    if (questions.length === 0) {
      setError('Please add at least one question.');
      setSnackbar({ message: 'Please add at least one question.', severity: 'error' });
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        const message = `Question ${i + 1} is missing text.`;
        setError(message);
        setSnackbar({ message, severity: 'error' });
        return;
      }
      if (q.options.length < 8) {
        const message = `Question ${i + 1} needs 8 options.`;
        setError(message);
        setSnackbar({ message, severity: 'error' });
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        const message = `Question ${i + 1} has empty options.`;
        setError(message);
        setSnackbar({ message, severity: 'error' });
        return;
      }
    }

    const quiz = {
      title: quizTitle,
      posts: [], // No posts for manual quizzes
      questions,
      creatorId: user?.id,
      creatorName: user?.username,
      creatorStripeAccountId: user?.stripeAccountId,
      answerPrice: answerPrice, // Price to unlock creator's answers
    };
    try {
      await createQuiz(quiz);
      setSuccess('Quiz created successfully!');
      setSnackbar({ message: 'Quiz created successfully!', severity: 'success' });
      setTimeout(() => {
        navigate('/profile', { state: { tab: 0 } });
      }, 1500);
    } catch (saveError) {
      console.error('Failed to save quiz:', saveError);
      setError('Failed to save quiz. Please try again.');
      setSnackbar({ message: 'Failed to save quiz. Please try again.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Create Quiz Manually
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Create custom quiz questions from scratch
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <AIGeneratedQuestions onQuestionsGenerated={handleAiQuestions} />

      {/* Quiz Title */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Quiz Title"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder="Enter a catchy title for your quiz"
            required
          />
        </CardContent>
      </Card>

      {/* Create Questions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Quiz Questions
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addQuestion}
            >
              Add Question
            </Button>
          </Box>

          {questions.map((q, qIndex) => (
            <Card key={qIndex} variant="outlined" sx={{ mb: 2, p: 2 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Question {qIndex + 1}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeQuestion(qIndex)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <TextField
                  fullWidth
                  label="Question Text"
                  value={q.text}
                  onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                  placeholder="Enter your question"
                  multiline
                  rows={2}
                />

                <Divider />

                <Typography variant="subtitle2" color="text.secondary">
                  Answer Options
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleGenerateOptions(qIndex)}
                    disabled={optionLoading[qIndex]}
                    startIcon={optionLoading[qIndex] ? <CircularProgress size={16} /> : undefined}
                  >
                    Generar opciones con IA
                  </Button>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr', lg: '1fr 1fr' },
                    gap: { xs: 1.5, sm: 2 },
                  }}
                >
                  {q.options.map((opt, oIndex) => (
                    <TextField
                      key={oIndex}
                      fullWidth
                      label={`Option ${oIndex + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      placeholder={`Enter option ${oIndex + 1}`}
                      multiline
                      minRows={2}
                      maxRows={4}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          minHeight: '60px',
                          alignItems: 'flex-start',
                          paddingTop: '12px',
                          paddingBottom: '12px',
                        },
                        '& .MuiInputLabel-root': {
                          transform: 'translate(14px, 12px) scale(1)',
                          '&.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -9px) scale(0.75)',
                          },
                        },
                      }}
                    />
                  ))}
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Correct Answer</InputLabel>
                  <Select
                    value={q.correct}
                    label="Correct Answer"
                    onChange={(e) => updateQuestion(qIndex, 'correct', e.target.value as number)}
                  >
                    {q.options.map((_, oIndex) => (
                      <MenuItem key={oIndex} value={oIndex}>
                        Option {oIndex + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Card>
          ))}

          {questions.length === 0 && (
            <Alert severity="info">
              Click "Add Question" to start creating quiz questions
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Price Selection */}
      {questions.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Configuración de Precio
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Establece un precio para que los seguidores puedan desbloquear tus respuestas (opcional)
            </Typography>
            <PriceSelector
              value={answerPrice}
              onChange={setAnswerPrice}
            />
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      {questions.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setQuizTitle('');
              setQuestions([]);
            }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={saveQuiz}
          >
            Save Quiz
          </Button>
        </Box>
      )}

      {/* Title Reminder Dialog */}
      <Dialog
        open={titleDialogOpen}
        onClose={handleTitleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Recuerda agregar un título</DialogTitle>
        <DialogContent>
          <Typography>
            Por favor, agrega un título atractivo para tu cuestionario antes de guardarlo.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTitleDialogClose} variant="contained">
            Entendido
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {snackbar ? (
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
};

export default CreateQuizManual;
