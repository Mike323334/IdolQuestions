import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { deleteQuizById, getQuizzesByCreator } from '../../services/quizzes';

interface Quiz {
  id: string;
  title: string;
  posts: any[];
  questions: any[];
  creatorId?: string;
  creatorName?: string;
  createdAt?: string;
  answerPrice?: number | null;
}

const MyQuizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadQuizzes = async () => {
    if (!user?.id) {
      setQuizzes([]);
      return;
    }
    try {
      const userQuizzes = await getQuizzesByCreator(user.id);
      setQuizzes(userQuizzes);
    } catch (loadError) {
      console.error('Failed to load quizzes:', loadError);
      setQuizzes([]);
    }
  };

  const handleDeleteClick = (quizId: string) => {
    setQuizToDelete(quizId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (quizToDelete) {
      try {
        await deleteQuizById(quizToDelete);
        await loadQuizzes();
      } catch (deleteError) {
        console.error('Failed to delete quiz:', deleteError);
      }
    }
    setDeleteDialogOpen(false);
    setQuizToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setQuizToDelete(null);
  };

  if (quizzes.length === 0) {
    return (
      <Card
        sx={{
          textAlign: 'center',
          py: 8,
          backgroundColor: 'background.paper',
        }}
      >
        <CardContent>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You haven't created any quizzes yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start creating your first quiz to engage your followers!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
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
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                {quiz.title}
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Chip
                  label={`${quiz.questions.length} questions`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
                <Chip
                  label={`${quiz.posts.length} posts`}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              </Stack>

              {quiz.createdAt && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Created: {new Date(quiz.createdAt).toLocaleDateString()}
                </Typography>
              )}
            </CardContent>
            
            <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteClick(quiz.id)}
                  aria-label="delete quiz"
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
              <Button
                component={RouterLink}
                to={`/take-quiz?quizId=${quiz.id}`}
                variant="contained"
                size="small"
                startIcon={<PlayIcon />}
              >
                Preview
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Quiz?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this quiz? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MyQuizzes;
