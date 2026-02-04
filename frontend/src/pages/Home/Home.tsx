import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  Avatar,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  EmojiEvents as TrophyIcon,
  Create as CreateIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { getAllQuizzes } from '../../services/quizzes';

interface Quiz {
  id: string;
  title: string;
  posts: any[];
  questions: any[];
  creatorId?: string;
  creatorName?: string;
  createdAt?: string;
  isOnboarding?: boolean;
  answerPrice?: number | null;
}

const Home: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    if (loading || !isAuthenticated) {
      setQuizzes([]);
      return;
    }
    let isActive = true;
    const loadQuizzes = async () => {
      try {
        const displayQuizzes = (await getAllQuizzes()).filter((q) => !q.isOnboarding);
        if (isActive) {
          setQuizzes(displayQuizzes);
        }
      } catch (loadError) {
        console.error('Failed to load quizzes:', loadError);
        if (isActive) {
          setQuizzes([]);
        }
      }
    };

    loadQuizzes();
    return () => {
      isActive = false;
    };
  }, [user, isAuthenticated, loading]);

  return (
    <Layout>
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          py: { xs: 8, md: 12 },
          mb: 8,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            zIndex: 0,
          },
        }}
      >
        <Typography
          variant="h1"
          className="text-gradient"
          sx={{
            fontSize: { xs: '2.75rem', md: '4rem' },
            mb: 3,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            position: 'relative',
            zIndex: 1,
            lineHeight: 1.1,
          }}
        >
          Pon a Prueba Tu Conocimiento
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{
            mb: 5,
            fontWeight: 400,
            maxWidth: '700px',
            mx: 'auto',
            fontSize: { xs: '1.1rem', md: '1.25rem' },
            lineHeight: 1.7,
            position: 'relative',
            zIndex: 1,
          }}
        >
          Crea cuestionarios y desafía a tus seguidores
        </Typography>
        
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          justifyContent="center"
          sx={{ position: 'relative', zIndex: 1 }}
        >
          {isAuthenticated ? (
            <Button
              component={RouterLink}
              to="/profile/create-quiz"
              variant="contained"
              size="large"
              startIcon={<CreateIcon />}
              sx={{ 
                px: 5,
                py: 1.5,
                fontSize: '1rem',
                boxShadow: '0 8px 24px -6px rgba(99, 102, 241, 0.4)',
              }}
            >
              Crear Cuestionario
            </Button>
          ) : (
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              sx={{ 
                px: 5,
                py: 1.5,
                fontSize: '1rem',
                boxShadow: '0 8px 24px -6px rgba(99, 102, 241, 0.4)',
              }}
            >
              Comenzar
            </Button>
          )}
          
          <Button
            component={RouterLink}
            to="/results"
            variant="outlined"
            size="large"
            startIcon={<TrophyIcon />}
            sx={{ 
              px: 5,
              py: 1.5,
              fontSize: '1rem',
              borderWidth: 2,
            }}
          >
            Ver Tabla de Clasificación
          </Button>
        </Stack>
      </Box>

      {/* Featured Quizzes Section */}
      <Box sx={{ mb: 6 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4" fontWeight={600}>
            Cuestionarios Disponibles
          </Typography>
        </Box>

        {quizzes.length === 0 ? (
          <Card
            sx={{
              textAlign: 'center',
              py: 10,
              backgroundColor: 'background.paper',
              border: '2px dashed',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(139, 92, 246, 0.02) 100%)',
            }}
          >
            <CardContent>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'secondary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  opacity: 0.8,
                }}
              >
                <CreateIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 1 }}>
                Aún no hay cuestionarios disponibles
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '500px', mx: 'auto' }}>
                ¡Sé el primero en crear un cuestionario y desafía a la comunidad!
              </Typography>
              {isAuthenticated && (
                <Button
                  component={RouterLink}
                  to="/profile/create-quiz"
                  variant="contained"
                  size="large"
                  startIcon={<CreateIcon />}
                  sx={{ px: 4 }}
                >
                  Crea Tu Primer Cuestionario
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
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
            {quizzes.map((quiz, index) => (
              <Box key={quiz.id} className="fade-in" sx={{ animationDelay: `${index * 0.1}s` }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 20px 40px -12px rgba(99, 102, 241, 0.3)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          fontSize: '1rem',
                          fontWeight: 600,
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                        }}
                      >
                        {quiz.creatorName?.charAt(0).toUpperCase() || 'Q'}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {quiz.creatorName || 'Anonymous'}
                      </Typography>
                    </Stack>

                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      fontWeight={700}
                      sx={{ 
                        mb: 2,
                        minHeight: '3em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {quiz.title}
                    </Typography>
                    
                    <Stack direction="row" spacing={1} sx={{ mt: 'auto' }} flexWrap="wrap">
                      <Chip
                        label={`${quiz.questions.length} preguntas`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(99, 102, 241, 0.1)',
                          color: 'primary.main',
                          fontWeight: 600,
                          border: '1px solid',
                          borderColor: 'rgba(99, 102, 241, 0.2)',
                        }}
                      />
                      <Chip
                        label={`${quiz.posts.length} posts`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(139, 92, 246, 0.1)',
                          color: 'secondary.main',
                          fontWeight: 600,
                          border: '1px solid',
                          borderColor: 'rgba(139, 92, 246, 0.2)',
                        }}
                      />
                      {quiz.answerPrice && quiz.answerPrice > 0 && (
                        <Chip
                          icon={<Typography sx={{ fontSize: '0.75rem' }}>💰</Typography>}
                          label={`$${quiz.answerPrice}`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(16, 185, 129, 0.1)',
                            color: 'success.main',
                            fontWeight: 700,
                            border: '1px solid',
                            borderColor: 'rgba(16, 185, 129, 0.2)',
                          }}
                        />
                      )}
                    </Stack>
                  </CardContent>
                  
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      component={RouterLink}
                      to={`/take-quiz?quizId=${quiz.id}`}
                      variant="contained"
                      fullWidth
                      startIcon={<PlayIcon />}
                      sx={{
                        py: 1.5,
                        fontWeight: 600,
                      }}
                    >
                      Tomar Cuestionario
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10, mt: 8 }}>
        <Typography
          variant="h3"
          textAlign="center"
          fontWeight={800}
          className="text-gradient"
          sx={{ mb: 2 }}
        >
          Cómo Funciona
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 8, maxWidth: '600px', mx: 'auto' }}
        >
          Una plataforma simple y poderosa para crear y tomar cuestionarios interactivos
        </Typography>
        
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)',
            },
            gap: 4,
          }}
        >
          <Card
            sx={{
              textAlign: 'center',
              p: 4,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
                borderColor: 'primary.main',
                boxShadow: '0 12px 24px -6px rgba(99, 102, 241, 0.2)',
              },
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: '0 8px 24px -6px rgba(99, 102, 241, 0.4)',
              }}
            >
              <CreateIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h6" gutterBottom fontWeight={700} sx={{ mb: 1.5 }}>
              Crear Cuestionarios
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Crea preguntas personalizadas o ya creadas para construir cuestionarios atractivos
            </Typography>
          </Card>

          <Card
            sx={{
              textAlign: 'center',
              p: 4,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
                borderColor: 'primary.main',
                boxShadow: '0 12px 24px -6px rgba(99, 102, 241, 0.2)',
              },
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: '0 8px 24px -6px rgba(139, 92, 246, 0.4)',
              }}
            >
              <PlayIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h6" gutterBottom fontWeight={700} sx={{ mb: 1.5 }}>
              Tomar Cuestionarios
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Desafíate con cuestionarios de tus creadores favoritos
            </Typography>
          </Card>

          <Card
            sx={{
              textAlign: 'center',
              p: 4,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
                borderColor: 'primary.main',
                boxShadow: '0 12px 24px -6px rgba(99, 102, 241, 0.2)',
              },
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: '0 8px 24px -6px rgba(16, 185, 129, 0.4)',
              }}
            >
              <TrophyIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h6" gutterBottom fontWeight={700} sx={{ mb: 1.5 }}>
              Compite y Gana
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Sube en la tabla de clasificación y gana insignias por tus logros
            </Typography>
          </Card>
        </Box>
      </Box>
    </Layout>
  );
};

export default Home;
