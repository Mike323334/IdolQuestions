import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Avatar,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import {
  Quiz as QuizIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import MyQuizzes from './MyQuizzes';
import CreateQuiz from './CreateQuiz';

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (location.state && location.state.tab !== undefined) {
      setTabValue(location.state.tab);
    }
  }, [location.state]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        {/* Profile Header */}
        <Paper
          sx={{
            p: 5,
            mb: 4,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 8s ease infinite',
            color: 'white',
            boxShadow: '0 20px 60px -12px rgba(99, 102, 241, 0.4)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              filter: 'blur(40px)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -50,
              left: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              filter: 'blur(40px)',
            },
          }}
        >
          <Stack direction="row" spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'white',
                color: 'primary.main',
                fontSize: '2.5rem',
                fontWeight: 800,
                boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.3)',
                border: '4px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h3" fontWeight={800} gutterBottom sx={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
                {user.username}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.95, fontSize: '1.1rem' }}>
                {user.email}
              </Typography>
              {user.role && (
                <Chip
                  label={user.role}
                  sx={{
                    mt: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 600,
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                />
              )}
            </Box>
            <Stack direction="row" spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  borderWidth: 2,
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                Logout
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Tabs */}
        <Paper 
          sx={{ 
            mb: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="profile tabs"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
              },
            }}
          >
            <Tab
              icon={<QuizIcon />}
              iconPosition="start"
              label="Mis Cuestionarios"
              id="profile-tab-0"
              aria-controls="profile-tabpanel-0"
            />
            <Tab
              icon={<AddIcon />}
              iconPosition="start"
              label="Crear Cuestionario"
              id="profile-tab-1"
              aria-controls="profile-tabpanel-1"
            />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <MyQuizzes />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <CreateQuiz />
        </TabPanel>
      </Container>
    </Layout>
  );
};

export default Profile;
