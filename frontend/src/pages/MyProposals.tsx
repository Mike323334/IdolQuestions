import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Alert,
  Stack,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  HelpOutline as HelpOutlineIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getSentProposals, QuestionProposal } from '../services/api';

const MyProposals: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [proposals, setProposals] = useState<QuestionProposal[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [error, setError] = useState('');

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

    loadProposals();
  }, [user, loading, navigate]);

  const loadProposals = async () => {
    try {
      setProposalsLoading(true);
      const response = await getSentProposals();
      setProposals(response.proposals);
    } catch (error) {
      console.error('Error loading proposals:', error);
      setError(error instanceof Error ? error.message : 'Error cargando propuestas');
    }
    setProposalsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon color="success" />;
      case 'rejected':
        return <CancelIcon color="error" />;
      default:
        return <ScheduleIcon color="warning" />;
    }
  };

  const getStatusColor = (status: string): "success" | "error" | "warning" | "default" => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobada';
      case 'rejected':
        return 'Rechazada';
      default:
        return 'Pendiente';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha no válida';
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HelpOutlineIcon sx={{ fontSize: 'inherit', color: 'primary.main' }} />
              Mis Propuestas
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Revisa el estado de las preguntas que has propuesto
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/propose-question')}
            sx={{ fontWeight: 600 }}
          >
            Nueva Propuesta
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {proposalsLoading ? (
          <LoadingSpinner message="Cargando propuestas..." />
        ) : proposals.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <HelpOutlineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No has enviado propuestas aún
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                ¡Propón preguntas interesantes a tus creadores favoritos!
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/propose-question')}
              >
                Crear Primera Propuesta
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={3}>
            {proposals.map((proposal) => (
              <Card key={proposal.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {proposal.question_text}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Propuesta para: <strong>{proposal.creator_name}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Enviada: {formatDate(proposal.created_at)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(proposal.status)}
                      <Chip
                        label={getStatusText(proposal.status)}
                        color={getStatusColor(proposal.status)}
                        size="small"
                      />
                    </Box>
                  </Box>

                  {proposal.category && (
                    <Chip
                      label={proposal.category}
                      size="small"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" gutterBottom>
                    Opciones propuestas:
                  </Typography>
                  <List dense>
                    {proposal.options.map((option, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={index + 1}
                                size="small"
                                color={
                                  proposal.status !== 'pending' && proposal.correct_answer !== null && index === proposal.correct_answer 
                                    ? 'success' 
                                    : 'default'
                                }
                                variant={
                                  proposal.status !== 'pending' && proposal.correct_answer !== null && index === proposal.correct_answer 
                                    ? 'filled' 
                                    : 'outlined'
                                }
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 
                                    proposal.status !== 'pending' && proposal.correct_answer !== null && index === proposal.correct_answer 
                                      ? 600 
                                      : 400,
                                  color: 
                                    proposal.status !== 'pending' && proposal.correct_answer !== null && index === proposal.correct_answer 
                                      ? 'success.main' 
                                      : 'text.primary'
                                }}
                              >
                                {option}
                                {proposal.status !== 'pending' && proposal.correct_answer !== null && index === proposal.correct_answer && ' ✓'}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  {proposal.status === 'pending' && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                      La respuesta correcta se mostrará una vez que el creador revise tu propuesta
                    </Typography>
                  )}

                  {proposal.explanation && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Explicación:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {proposal.explanation}
                      </Typography>
                    </>
                  )}

                  {proposal.status !== 'pending' && proposal.reviewed_at && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Revisada: {formatDate(proposal.reviewed_at)}
                      </Typography>
                      {proposal.review_comment && (
                        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                          Comentario: "{proposal.review_comment}"
                        </Typography>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    </Layout>
  );
};

export default MyProposals;