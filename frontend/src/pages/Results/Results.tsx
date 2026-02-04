import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';

interface Quiz {
  creatorId: string;
  creatorTaken?: boolean;
  questions: { text: string; options: string[]; correct: number; type: string }[];
  title: string;
}

interface UserScore {
  name: string;
  score: number;
  rank?: number;
}

const Results: React.FC = () => {
  const [users, setUsers] = useState<UserScore[]>([]);

  useEffect(() => {
    const quizAnswers = JSON.parse(localStorage.getItem('quizAnswers') || '{}');
    const quizzes: Quiz[] = JSON.parse(localStorage.getItem('quizzes') || '[]');
    const scores: { [name: string]: number } = {};

    Object.keys(quizAnswers).forEach((quizId: string) => {
      const quizIndex = parseInt(quizId);
      const quiz = quizzes[quizIndex];
      if (!quiz) return;

      const fanAnswers = quizAnswers[quizId].fanAnswers || {};

      Object.keys(fanAnswers).forEach((fanName: string) => {
        const fanAns = fanAnswers[fanName];
        let score = 0;
        quiz.questions.forEach((q, qIndex) => {
          if (fanAns[qIndex] === q.correct) {
            score += 1;
          }
        });
        scores[fanName] = (scores[fanName] || 0) + score;
      });
    });

    const sortedUsers = Object.entries(scores)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([name, score], index: number) => ({
        name,
        score: score as number,
        rank: index + 1
      }));
    setUsers(sortedUsers);
  }, []);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return '#6366f1'; // Default
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <TrophyIcon sx={{ color: getRankColor(rank) }} />;
    }
    return <StarIcon sx={{ color: 'text.secondary' }} />;
  };

  return (
    <Layout>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Leaderboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Top performers ranked by score
        </Typography>
      </Box>

      {users.length === 0 ? (
        <Card
          sx={{
            textAlign: 'center',
            py: 8,
            backgroundColor: 'background.paper',
          }}
        >
          <CardContent>
            <TrophyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No rankings yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to take a quiz and appear on the leaderboard!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {/* Top 3 Podium */}
          {users.length >= 3 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 2,
                mb: 4,
                maxWidth: '800px',
                mx: 'auto',
              }}
            >
              {/* 2nd Place */}
              <Box sx={{ order: { xs: 2, sm: 1 }, mt: { xs: 0, sm: 4 } }}>
                <Card
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    background: 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 100%)',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'white',
                      color: '#C0C0C0',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                    }}
                  >
                    {users[1].name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {users[1].name}
                  </Typography>
                  <Chip
                    icon={<TrophyIcon />}
                    label="2nd Place"
                    sx={{
                      bgcolor: 'white',
                      color: '#C0C0C0',
                      fontWeight: 600,
                      mb: 1,
                    }}
                  />
                  <Typography variant="h5" fontWeight={700} color="white">
                    {users[1].score}
                  </Typography>
                  <Typography variant="caption" color="white">
                    points
                  </Typography>
                </Card>
              </Box>

              {/* 1st Place */}
              <Box sx={{ order: { xs: 1, sm: 2 } }}>
                <Card
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'white',
                      color: '#FFD700',
                      fontSize: '2rem',
                      fontWeight: 700,
                    }}
                  >
                    {users[0].name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {users[0].name}
                  </Typography>
                  <Chip
                    icon={<TrophyIcon />}
                    label="1st Place"
                    sx={{
                      bgcolor: 'white',
                      color: '#FFD700',
                      fontWeight: 700,
                      mb: 1,
                    }}
                  />
                  <Typography variant="h4" fontWeight={700} color="white">
                    {users[0].score}
                  </Typography>
                  <Typography variant="caption" color="white">
                    points
                  </Typography>
                </Card>
              </Box>

              {/* 3rd Place */}
              <Box sx={{ order: 3, mt: { xs: 0, sm: 4 } }}>
                <Card
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    background: 'linear-gradient(135deg, #CD7F32 0%, #D4A574 100%)',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'white',
                      color: '#CD7F32',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                    }}
                  >
                    {users[2].name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {users[2].name}
                  </Typography>
                  <Chip
                    icon={<TrophyIcon />}
                    label="3rd Place"
                    sx={{
                      bgcolor: 'white',
                      color: '#CD7F32',
                      fontWeight: 600,
                      mb: 1,
                    }}
                  />
                  <Typography variant="h5" fontWeight={700} color="white">
                    {users[2].score}
                  </Typography>
                  <Typography variant="caption" color="white">
                    points
                  </Typography>
                </Card>
              </Box>
            </Box>
          )}

          {/* Full Rankings List */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                All Rankings
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                {users.map((user, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: index < 3 ? 'action.hover' : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: index < 3 ? getRankColor(user.rank!) : 'action.selected',
                        color: index < 3 ? 'white' : 'text.primary',
                        fontWeight: 700,
                        mr: 2,
                      }}
                    >
                      {user.rank}
                    </Box>

                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'secondary.main',
                        mr: 2,
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" fontWeight={600}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.score} points
                      </Typography>
                    </Box>

                    {getRankIcon(user.rank!)}
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}
    </Layout>
  );
};

export default Results;
