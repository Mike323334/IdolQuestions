import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { createStripeConnectAccount, checkUsernameAvailability } from '../../services/api';

const Settings: React.FC = () => {
  const { user, logout, requestAccountDeletion } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameValid, setUsernameValid] = useState(true); // Start as true since current username is valid

  if (!user) {
    navigate('/login');
    return null;
  }

  const validateUsername = async (usernameValue: string) => {
    // If username hasn't changed, it's valid
    if (usernameValue === user.username) {
      setUsernameError('');
      setUsernameValid(true);
      return;
    }

    if (!usernameValue.trim()) {
      setUsernameError('El nombre de usuario es requerido');
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
  }, [username, user.username]);

  const handleSaveProfile = () => {
    setError('');
    setSuccess('');

    if (!username.trim()) {
      setError(t('settings.error.required'));
      return;
    }

    if (!usernameValid) {
      setError('Por favor, elige un nombre de usuario válido y disponible');
      return;
    }

    const saveProfile = async () => {
      try {
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: username });
        }
        await updateDoc(doc(db, 'users', user.id), { username });
        setSuccess(t('settings.success.profile'));
      } catch (saveError) {
        console.error('Failed to update profile:', saveError);
        setError(t('settings.error.required'));
      }
    };

    saveProfile();
  };

  const handleStripeConnect = async () => {
    setError('');
    setSuccess('');
    setStripeLoading(true);
    try {
      const response = await createStripeConnectAccount(user.email);
      await updateDoc(doc(db, 'users', user.id), { stripeAccountId: response.account_id });
      setSuccess('Cuenta de Stripe conectada. Completa el onboarding en la nueva pestaña.');
      window.open(response.onboarding_url, '_blank', 'noopener,noreferrer');
    } catch (connectError) {
      console.error('Stripe connect error:', connectError);
      setError(connectError instanceof Error ? connectError.message : 'No se pudo conectar la cuenta de Stripe.');
    } finally {
      setStripeLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAccount = async () => {
    setDeleteDialogOpen(false);
    const success = await requestAccountDeletion();
    if (success) {
      setSuccess(t('settings.success.deletion'));
      // Logout after requesting deletion
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
    } else {
      setError(t('settings.error.deletion'));
    }
  };

  return (
    <Layout>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          {t('settings.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {t('settings.subtitle')}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        {/* Profile Settings */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                {t('settings.profile.title')}
              </Typography>
              <HelpOutlineIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              <TextField
                fullWidth
                label={t('settings.profile.username')}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError('');
                  setUsernameValid(e.target.value === user.username); // Valid if unchanged
                }}
                error={!!usernameError}
                helperText={usernameError || (usernameChecking ? 'Verificando disponibilidad...' : (usernameValid && username !== user.username ? 'Nombre de usuario disponible' : ''))}
              />

              <TextField
                fullWidth
                label={t('settings.profile.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
              />



              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                >
                  {t('settings.profile.save')}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {t('settings.password.title')}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Alert severity="info">
              Tu contraseña se gestiona con Google. Para cambiarla, hazlo desde tu cuenta de Google.
            </Alert>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                {t('settings.notifications.title')}
              </Typography>
              <HelpOutlineIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                }
                label={t('settings.notifications.enable')}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={emailUpdates}
                    onChange={(e) => setEmailUpdates(e.target.checked)}
                  />
                }
                label={t('settings.notifications.email')}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Stripe Connect */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                Stripe
              </Typography>
              <HelpOutlineIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Conecta tu cuenta de Stripe para recibir pagos de tus seguidores.
            </Typography>
            <Button
              variant="contained"
              onClick={handleStripeConnect}
              disabled={stripeLoading}
            >
              {stripeLoading ? 'Conectando...' : 'Conectar Stripe'}
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card sx={{ mb: 3, borderColor: 'error.main', borderWidth: 1, borderStyle: 'solid' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} color="error" gutterBottom>
              {t('settings.danger.title')}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('settings.danger.warning')}
            </Typography>

            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteAccount}
            >
              {t('settings.danger.delete')}
            </Button>
          </CardContent>
        </Card>

        {/* Account Deletion Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="error" />
            {t('settings.deleteDialog.title')}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              {t('settings.deleteDialog.message')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {t('settings.deleteDialog.details')}
            </Typography>
            <Typography variant="body2" color="error.main" sx={{ mt: 2, fontWeight: 600 }}>
              {t('settings.deleteDialog.irreversible')}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
              {t('settings.deleteDialog.cancel')}
            </Button>
            <Button onClick={confirmDeleteAccount} color="error" variant="contained">
              {t('settings.deleteDialog.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Settings;
