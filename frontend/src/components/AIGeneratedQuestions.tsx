import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { generateQuestions, QuestionGenerationRequest, GeneratedQuestion } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface AIGeneratedQuestionsProps {
  onQuestionsGenerated: (questions: GeneratedQuestion[]) => void;
}

const AIGeneratedQuestions: React.FC<AIGeneratedQuestionsProps> = ({
  onQuestionsGenerated,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [niche, setNiche] = useState('');
  const [bio, setBio] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionType, setQuestionType] = useState('engaging');

  const handleGenerate = async () => {
    if (!user) {
      setError('Debes estar autenticado para generar preguntas');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: QuestionGenerationRequest = {
        creator_name: user.username,
        creator_niche: niche || undefined,
        creator_bio: bio || undefined,
        number_of_questions: numQuestions,
        question_type: questionType,
        target_audience: 'fans',
      };

      const response = await generateQuestions(request);
      
      if (response.success && response.questions) {
        setQuestions(response.questions);
        onQuestionsGenerated(response.questions);
      } else {
        setError(response.message || 'Error al generar preguntas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con el servidor');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
            <AIIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Generar Preguntas con IA
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Usa Groq AI para crear preguntas interesantes que atraigan a tus fans
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Tu Nicho (opcional)"
            placeholder="Ej: fitness, moda, comedia, tecnología"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            helperText="Ayuda a la IA a generar preguntas más relevantes"
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Tu Bio o Descripción (opcional)"
            placeholder="Cuéntale a la IA sobre ti para generar preguntas más personalizadas"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Tipo de Preguntas</InputLabel>
              <Select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                label="Tipo de Preguntas"
              >
                <MenuItem value="engaging">Atractivas</MenuItem>
                <MenuItem value="personal">Personales</MenuItem>
                <MenuItem value="funny">Divertidas</MenuItem>
                <MenuItem value="deep">Profundas</MenuItem>
              </Select>
            </FormControl>

            <TextField
              type="number"
              label="Número de Preguntas"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
              inputProps={{ min: 1, max: 10 }}
              sx={{ width: 150 }}
            />
          </Box>

          <Button
            variant="contained"
            size="large"
            onClick={handleGenerate}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AIIcon />}
            sx={{
              py: 1.5,
              fontWeight: 600,
              boxShadow: '0 8px 24px -6px rgba(99, 102, 241, 0.4)',
            }}
          >
            {loading ? 'Generando Preguntas...' : 'Generar Preguntas con IA'}
          </Button>

          {questions.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Preguntas Generadas ({questions.length})
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {questions.map((q, index) => (
                  <Card key={index} variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip label={q.category} size="small" color="primary" />
                      <Chip label={q.label} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="body1" fontWeight={600} gutterBottom>
                      {q.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Opciones: {q.options.join(', ')}
                    </Typography>
                    {q.explanation && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        💡 {q.explanation}
                      </Typography>
                    )}
                  </Card>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AIGeneratedQuestions;
