import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  Container,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleRoleDialogOpen, setGoogleRoleDialogOpen] = useState(false);
  const [googleRole, setGoogleRole] = useState<'Content Creator' | 'Follower'>('Follower');
  
  const { login, signInWithGoogle, completeGoogleSignup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (success) {
      navigate('/profile');
    } else {
      setError('Correo electrónico o contraseña inválidos');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const result = await signInWithGoogle();
    setLoading(false);

    if (result.success && !result.needsRole) {
      navigate('/profile');
      return;
    }

    if (result.success && result.needsRole) {
      setGoogleRoleDialogOpen(true);
      return;
    }

    setError('No se pudo iniciar sesión con Google');
  };

  const handleGoogleRoleConfirm = async () => {
    setError('');
    setLoading(true);
    const success = await completeGoogleSignup(googleRole);
    setLoading(false);
    setGoogleRoleDialogOpen(false);

    if (success) {
      navigate('/profile');
    } else {
      setError('No se pudo iniciar sesión con Google');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        py: 4,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Card
          sx={{
            boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.15)',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
            },
          }}
        >
          <CardContent sx={{ p: 5 }}>
            <Box sx={{ mb: 5, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
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
                <Typography sx={{ color: 'white', fontSize: '2rem' }}>👋</Typography>
              </Box>
              <Typography variant="h4" component="h1" gutterBottom fontWeight={800} className="text-gradient">
                Bienvenido de vuelta
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Inicia sesión en tu cuenta para continuar
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={{
                mb: 3,
                py: 1.5,
                fontWeight: 600,
              }}
            >
              Continuar con Google
            </Button>

            <Divider sx={{ mb: 3 }}>o</Divider>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Correo Electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
                autoFocus
              />
              
              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="current-password"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  mt: 4, 
                  mb: 2,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: '0 8px 24px -6px rgba(99, 102, 241, 0.4)',
                }}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  ¿No tienes una cuenta?{' '}
                  <Link
                    component={RouterLink}
                    to="/register"
                    underline="hover"
                    fontWeight={600}
                  >
                    Regístrate
                  </Link>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>

      <Dialog
        open={googleRoleDialogOpen}
        onClose={() => setGoogleRoleDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Elige tu rol</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Rol</InputLabel>
            <Select
              value={googleRole}
              onChange={(e: SelectChangeEvent<'Content Creator' | 'Follower'>) => setGoogleRole(e.target.value as 'Content Creator' | 'Follower')}
              label="Rol"
            >
              <MenuItem value="Follower">Follower</MenuItem>
              <MenuItem value="Content Creator">Content Creator</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGoogleRoleDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleGoogleRoleConfirm} variant="contained" disabled={loading}>
            Continuar con Google
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
