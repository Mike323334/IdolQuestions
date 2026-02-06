import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  InputAdornment,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { checkUsernameAvailability } from '../../services/api';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'Content Creator' | 'Follower'>('Follower');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleRoleDialogOpen, setGoogleRoleDialogOpen] = useState(false);
  const [googleRole, setGoogleRole] = useState<'Content Creator' | 'Follower' | ''>('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameValid, setUsernameValid] = useState(false);
  
  const { register, signInWithGoogle, completeGoogleSignup } = useAuth();
  const navigate = useNavigate();

  const validateUsername = async (usernameValue: string) => {
    if (!usernameValue.trim()) {
      setUsernameError('');
      setUsernameValid(false);
      return;
    }

    if (usernameValue.length < 3) {
      setUsernameError('El nombre de usuario debe tener al menos 3 caracteres');
      setUsernameValid(false);
      return;
    }

    if (usernameValue.length > 30) {
      setUsernameError('El nombre de usuario no puede tener más de 30 caracteres');
      setUsernameValid(false);
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(usernameValue)) {
      setUsernameError('Solo se permiten letras, números, guiones y guiones bajos');
      setUsernameValid(false);
      return;
    }

    setUsernameChecking(true);
    try {
      const result = await checkUsernameAvailability(usernameValue);
      if (result.available) {
        setUsernameError('');
        setUsernameValid(true);
      } else {
        setUsernameError(result.message);
        setUsernameValid(false);
      }
    } catch (error) {
      setUsernameError('Error verificando disponibilidad');
      setUsernameValid(false);
    }
    setUsernameChecking(false);
  };

  // Debounced username validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username) {
        validateUsername(username);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !email || !password || !confirmPassword) {
      setError('Por favor, completa todos los campos');
      return;
    }

    if (!usernameValid) {
      setError('Por favor, elige un nombre de usuario válido y disponible');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    const success = await register(username, email, password, role);
    setLoading(false);

    if (success) {
      navigate('/profile');
    } else {
      setError('El registro falló. Por favor, inténtalo de nuevo.');
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleRoleDialogOpen(true);
  };

  const handleGoogleRoleConfirm = async () => {
    if (!googleRole) {
      setError('Selecciona un rol para continuar');
      return;
    }
    setError('');
    setLoading(true);
    const result = await signInWithGoogle(googleRole, username || undefined);
    if (result.success && result.needsRole) {
      const completed = await completeGoogleSignup(googleRole, username || undefined);
      setLoading(false);
      setGoogleRoleDialogOpen(false);
      if (completed) {
        navigate('/profile');
      } else {
        setError('No se pudo registrarse con Google');
      }
      return;
    }
    setLoading(false);
    setGoogleRoleDialogOpen(false);

    if (result.success) {
      navigate('/profile');
    } else {
      setError('No se pudo registrarse con Google');
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
                <Typography sx={{ color: 'white', fontSize: '2rem' }}>🚀</Typography>
              </Box>
              <Typography variant="h4" component="h1" gutterBottom fontWeight={800} className="text-gradient">
                Crear una cuenta
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Únete a IdolQuestions y comienza a crear cuestionarios
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
              onClick={handleGoogleSignup}
              disabled={loading}
              sx={{
                mb: 3,
                py: 1.5,
                fontWeight: 600,
              }}
            >
              Registrarse con Google
            </Button>

            <Divider sx={{ mb: 3 }}>o</Divider>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Nombre de usuario"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError('');
                  setUsernameValid(false);
                }}
                margin="normal"
                required
                autoComplete="username"
                autoFocus
                error={!!usernameError}
                helperText={usernameError || (usernameChecking ? 'Verificando disponibilidad...' : (usernameValid ? 'Nombre de usuario disponible' : ''))}
                InputProps={{
                  endAdornment: usernameChecking ? (
                    <InputAdornment position="end">
                      <Typography variant="caption" color="text.secondary">
                        Verificando...
                      </Typography>
                    </InputAdornment>
                  ) : usernameValid ? (
                    <InputAdornment position="end">
                      <Typography variant="caption" color="success.main">
                        ✓
                      </Typography>
                    </InputAdornment>
                  ) : null,
                }}
              />

              <TextField
                fullWidth
                label="Correo Electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
              />
              
              <TextField
                fullWidth
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="new-password"
                helperText="Debe tener al menos 6 caracteres"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirmar Contraseña"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl fullWidth margin="normal" required>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={role}
                  onChange={(e: SelectChangeEvent<'Content Creator' | 'Follower'>) => setRole(e.target.value as 'Content Creator' | 'Follower')}
                  label="Rol"
                >
                  <MenuItem value="Follower">Follower</MenuItem>
                  <MenuItem value="Content Creator">Content Creator</MenuItem>
                </Select>
              </FormControl>

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
                {loading ? 'Creando cuenta...' : 'Registrarse'}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  ¿Ya tienes una cuenta?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    underline="hover"
                    fontWeight={600}
                  >
                    Iniciar Sesión
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
              onChange={(e: SelectChangeEvent<'Content Creator' | 'Follower' | ''>) => setGoogleRole(e.target.value as 'Content Creator' | 'Follower' | '')}
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
          <Button onClick={handleGoogleRoleConfirm} variant="contained" disabled={loading || !googleRole}>
            Continuar con Google
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Register;
