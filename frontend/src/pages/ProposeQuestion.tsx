import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createQuestionProposal, CreateProposalRequest, getContentCreators, testBackendConnection } from '../services/api';
import { getContentCreatorsFromFirestore } from '../services/firestore';

interface ContentCreator {
  id: string;
  username: string;
  email: string;
}

const ProposeQuestion: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [category, setCategory] = useState('');
  const [explanation, setExplanation] = useState('');
  const [selectedCreator, setSelectedCreator] = useState('');
  const [creators, setCreators] = useState<ContentCreator[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'Follower') {
      navigate('/profile');
      return;
    }

    loadContentCreators();
  }, [user, loading, navigate]);

  const loadContentCreators = async () => {
    try {
      // Test backend connection first
      const backendConnected = await testBackendConnection();
      console.log('Backend connected:', backendConnected);
      
      if (backendConnected) {
        // Try API first
        const creatorsList = await getContentCreators();
        setCreators(creatorsList);
      } else {
        throw new Error('Backend not available');
      }
    } catch (apiError) {
      console.warn('API failed, trying Firestore directly:', apiError);
      try {
        // Fallback to Firestore direct access
        const creatorsList = await getContentCreatorsFromFirestore();
        setCreators(creatorsList);
        setError(''); // Clear any previous errors
      } catch (firestoreError) {
        console.error('Error loading content creators from Firestore:', firestoreError);
        setError('Error cargando creadores de contenido. Asegúrate de que el backend esté ejecutándose.');
      }
    }
  };

  const handleAddOption = () => {
    if (options.length < 8) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 4) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!questionText.trim()) {
      setError('La pregunta es requerida');
      return;
    }

    if (!selectedCreator) {
      setError('Debes seleccionar un creador de contenido');
      return;
    }

    const filledOptions = options.filter(opt => opt.trim());
    if (filledOptions.length < 4) {
      setError('Debes proporcionar al menos 4 opciones');
      return;
    }


    const selectedCreatorData = creators.find(c => c.id === selectedCreator);
    if (!selectedCreatorData) {
      setError('Creador seleccionado no válido');
      return;
    }

    setSubmitting(true);
    try {
      const request: CreateProposalRequest = {
        question_text: questionText.trim(),
        options: filledOptions,
        category: category || 'General',
        explanation: explanation.trim() || undefined,
        creator_id: selectedCreator,
        creator_name: selectedCreatorData.username,
      };

      await createQuestionProposal(request);
      setSuccess('¡Propuesta enviada exitosamente! El creador la revisará pronto.');
      
      // Reset form
      setQuestionText('');
      setOptions(['', '', '', '']);
      setCategory('');
      setExplanation('');
      setSelectedCreator('');
      
    } catch (error) {
      console.error('Error creating proposal:', error);
      setError(error instanceof Error ? error.message : 'Error enviando la propuesta');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <LoadingSpinner message="Cargando página..." />
        </Container>
      </Layout>
    );
  }

  if (!user || user.role !== 'Follower') {
    return null;
  }

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <HelpOutlineIcon sx={{ fontSize: 'inherit', color: 'primary.main' }} />
            Proponer Pregunta
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Propón preguntas interesantes a tus creadores de contenido favoritos
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Card>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* Creator Selection */}
                <FormControl fullWidth required>
                  <InputLabel>Creador de Contenido</InputLabel>
                  <Select
                    value={selectedCreator}
                    onChange={(e) => setSelectedCreator(e.target.value)}
                    label="Creador de Contenido"
                  >
                    {creators.map((creator) => (
                      <MenuItem key={creator.id} value={creator.id}>
                        {creator.username}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Question Text */}
                <TextField
                  fullWidth
                  label="Pregunta"
                  multiline
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  required
                  helperText="Escribe una pregunta clara e interesante"
                />

                {/* Category */}
                <TextField
                  fullWidth
                  label="Categoría (opcional)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  helperText="Ej: Entretenimiento, Deportes, Música, etc."
                />

                <Divider />

                {/* Options */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Opciones de Respuesta
                  </Typography>
                  
                  <Stack spacing={2}>
                    {options.map((option, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip 
                          label={`${index + 1}`} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                        <TextField
                          fullWidth
                          label={`Opción ${index + 1}`}
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          required={index < 4}
                          multiline
                          minRows={1}
                          maxRows={3}
                        />
                        {options.length > 4 && (
                          <IconButton 
                            onClick={() => handleRemoveOption(index)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                  </Stack>

                  {options.length < 8 && (
                    <Button
                      startIcon={<AddIcon />}
                      onClick={handleAddOption}
                      sx={{ mt: 2 }}
                      variant="outlined"
                      size="small"
                    >
                      Agregar Opción
                    </Button>
                  )}
                </Box>


                {/* Explanation */}
                <TextField
                  fullWidth
                  label="Explicación (opcional)"
                  multiline
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  helperText="Explica por qué esta es la respuesta correcta"
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  startIcon={<SendIcon />}
                  sx={{ 
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  {submitting ? 'Enviando...' : 'Enviar Propuesta'}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Layout>
  );
};

export default ProposeQuestion;