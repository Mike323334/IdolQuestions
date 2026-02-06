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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import {
  HelpOutline as HelpOutlineIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getReceivedProposals, reviewProposal, QuestionProposal } from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`proposals-tabpanel-${index}`}
      aria-labelledby={`proposals-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ReviewProposals: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [proposals, setProposals] = useState<QuestionProposal[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<QuestionProposal | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [selectedCorrectAnswer, setSelectedCorrectAnswer] = useState<number | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'Content Creator') {
      navigate('/profile');
      return;
    }

    loadProposals();
  }, [user, loading, navigate]);

  const loadProposals = async () => {
    try {
      setProposalsLoading(true);
      const response = await getReceivedProposals();
      setProposals(response.proposals);
    } catch (error) {
      console.error('Error loading proposals:', error);
      setError(error instanceof Error ? error.message : 'Error cargando propuestas');
    }
    setProposalsLoading(false);
  };

  const handleReview = (proposal: QuestionProposal) => {
    setSelectedProposal(proposal);
    setReviewComment('');
    setSelectedCorrectAnswer(null);
    setReviewDialogOpen(true);
  };

  const submitReview = async (status: 'approved' | 'rejected') => {
    if (!selectedProposal) return;

    // If approving, require correct answer selection
    if (status === 'approved' && selectedCorrectAnswer === null) {
      setError('Debes seleccionar la respuesta correcta para aprobar la propuesta');
      return;
    }

    setReviewLoading(true);
    try {
      await reviewProposal(selectedProposal.id!, {
        proposal_id: selectedProposal.id!,
        status,
        correct_answer: status === 'approved' ? (selectedCorrectAnswer ?? undefined) : undefined,
        review_comment: reviewComment.trim() || undefined,
      });

      // Update local state
      setProposals(proposals.map(p => 
        p.id === selectedProposal.id 
          ? { 
              ...p, 
              status, 
              correct_answer: status === 'approved' ? selectedCorrectAnswer : p.correct_answer,
              review_comment: reviewComment.trim(), 
              reviewed_at: new Date().toISOString() 
            } as QuestionProposal
          : p
      ));

      setReviewDialogOpen(false);
      setSelectedProposal(null);
      setReviewComment('');
      setSelectedCorrectAnswer(null);
      setError(''); // Clear any errors
    } catch (error) {
      console.error('Error reviewing proposal:', error);
      setError(error instanceof Error ? error.message : 'Error revisando propuesta');
    }
    setReviewLoading(false);
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

  const filterProposals = (status: string) => {
    if (status === 'all') return proposals;
    return proposals.filter(p => p.status === status);
  };

  const getTabProposals = () => {
    switch (tabValue) {
      case 0: return filterProposals('pending');
      case 1: return filterProposals('approved');
      case 2: return filterProposals('rejected');
      default: return proposals;
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

  if (!user || user.role !== 'Content Creator') {
    return null;
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HelpOutlineIcon sx={{ fontSize: 'inherit', color: 'primary.main' }} />
            Propuestas Recibidas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Revisa las preguntas propuestas por tus seguidores
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label={`Pendientes (${filterProposals('pending').length})`} />
            <Tab label={`Aprobadas (${filterProposals('approved').length})`} />
            <Tab label={`Rechazadas (${filterProposals('rejected').length})`} />
          </Tabs>
        </Box>

        {proposalsLoading ? (
          <LoadingSpinner message="Cargando propuestas..." />
        ) : (
          <TabPanel value={tabValue} index={tabValue}>
            {getTabProposals().length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <HelpOutlineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {tabValue === 0 ? 'No hay propuestas pendientes' : 
                     tabValue === 1 ? 'No hay propuestas aprobadas' : 
                     'No hay propuestas rechazadas'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tabValue === 0 ? 'Las nuevas propuestas aparecerán aquí' : 
                     'Las propuestas revisadas aparecerán aquí'}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Stack spacing={3}>
                {getTabProposals().map((proposal) => (
                  <Card key={proposal.id}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {proposal.question_text}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Propuesta de: <strong>{proposal.follower_name}</strong>
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
                                    color={proposal.correct_answer !== null && index === proposal.correct_answer ? 'success' : 'default'}
                                    variant={proposal.correct_answer !== null && index === proposal.correct_answer ? 'filled' : 'outlined'}
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: proposal.correct_answer !== null && index === proposal.correct_answer ? 600 : 400,
                                      color: proposal.correct_answer !== null && index === proposal.correct_answer ? 'success.main' : 'text.primary'
                                    }}
                                  >
                                    {option}
                                    {proposal.correct_answer !== null && index === proposal.correct_answer && ' ✓ (Correcta)'}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>

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

                      {proposal.status === 'pending' && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                              variant="contained"
                              color="success"
                              startIcon={<ThumbUpIcon />}
                              onClick={() => handleReview(proposal)}
                            >
                              Revisar
                            </Button>
                          </Box>
                        </>
                      )}

                      {proposal.status !== 'pending' && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="body2" color="text.secondary">
                            Revisada: {formatDate(proposal.reviewed_at)}
                          </Typography>
                          {proposal.review_comment && (
                            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                              Tu comentario: "{proposal.review_comment}"
                            </Typography>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </TabPanel>
        )}

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Revisar Propuesta
          </DialogTitle>
          <DialogContent>
            {selectedProposal && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedProposal.question_text}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Propuesta de: {selectedProposal.follower_name}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Opciones propuestas:
              </Typography>
              {selectedProposal?.options.map((option, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip
                    label={index + 1}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Typography variant="body2">
                    {option}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Selecciona la respuesta correcta:
              </Typography>
              <RadioGroup
                value={selectedCorrectAnswer}
                onChange={(e) => setSelectedCorrectAnswer(parseInt(e.target.value))}
              >
                {selectedProposal?.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={index}
                    control={<Radio />}
                    label={`Opción ${index + 1}: ${option}`}
                  />
                ))}
              </RadioGroup>
            </Box>
            
            <TextField
              fullWidth
              label="Comentario (opcional)"
              multiline
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              helperText="Agrega un comentario para el seguidor"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewDialogOpen(false)} disabled={reviewLoading}>
              Cancelar
            </Button>
            <Button
              onClick={() => submitReview('rejected')}
              disabled={reviewLoading}
              color="error"
              startIcon={<ThumbDownIcon />}
            >
              Rechazar
            </Button>
            <Button
              onClick={() => submitReview('approved')}
              disabled={reviewLoading}
              color="success"
              variant="contained"
              startIcon={<ThumbUpIcon />}
            >
              Aprobar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default ReviewProposals;