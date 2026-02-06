import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AddIcon from '@mui/icons-material/Add';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Container,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  EmojiEvents as TrophyIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSwitcher from '../LanguageSwitcher';

const Navigation: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Inicio', icon: <HomeIcon /> },
    { path: '/browse-quizzes', label: 'Explorar Cuestionarios', icon: <LibraryBooksIcon /> },
    { path: '/results', label: 'Resultados', icon: <TrophyIcon /> },
  ];

  const followerLinks = [
    { path: '/propose-question', label: 'Proponer Pregunta', icon: <AddIcon /> },
    { path: '/my-proposals', label: 'Mis Propuestas', icon: <LibraryBooksIcon /> },
  ];

  const creatorLinks = [
    { path: '/review-proposals', label: 'Revisar Propuestas', icon: <LibraryBooksIcon /> },
  ];

  const profileMenuItems = user?.role === 'Content Creator' ? [
    { path: '/profile', label: 'Perfil', icon: <PersonIcon /> },
    { path: '/profile/create-quiz', label: 'Crear Cuestionario', icon: <AddIcon /> },
    { path: '/profile/my-quizzes', label: 'Mis Cuestionarios', icon: <LibraryBooksIcon /> },
    { path: '/review-proposals', label: 'Revisar Propuestas', icon: <LibraryBooksIcon /> },
    { path: '/settings', label: 'Configuración', icon: <SettingsIcon /> },
  ] : [
    { path: '/profile', label: 'Perfil', icon: <PersonIcon /> },
    { path: '/propose-question', label: 'Proponer Pregunta', icon: <AddIcon /> },
    { path: '/my-proposals', label: 'Mis Propuestas', icon: <LibraryBooksIcon /> },
    { path: '/settings', label: 'Configuración', icon: <SettingsIcon /> },
  ];

  return (
    <>
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={0}
        sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: '64px' }}>
            {/* Logo */}
            <Typography
              variant="h6"
              component={Link}
              to="/"
              className="text-gradient"
              sx={{
                fontWeight: 800,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                mr: 4,
                fontSize: '1.5rem',
                letterSpacing: '-0.02em',
                transition: 'all 0.3s',
                color: '#000000 !important', // Force black color
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              IdolQuestions
            </Typography>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
                {navLinks.map((link) => (
                  <Button
                    key={link.path}
                    component={Link}
                    to={link.path}
                    sx={{
                      color: isActive(link.path) ? 'primary.main' : 'text.secondary',
                      fontWeight: isActive(link.path) ? 700 : 500,
                      px: 3,
                      py: 1,
                      borderRadius: '10px',
                      position: 'relative',
                      transition: 'all 0.3s',
                      '&::after': isActive(link.path) ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '60%',
                        height: 3,
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        borderRadius: '3px 3px 0 0',
                      } : {},
                      '&:hover': {
                        backgroundColor: 'rgba(99, 102, 241, 0.08)',
                        color: 'primary.main',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <Box sx={{ flexGrow: 1 }}>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleMobileMenuToggle}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Auth Buttons */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {isAuthenticated ? (
                <>
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    sx={{ p: 0 }}
                  >
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        width: 40,
                        height: 40,
                        fontSize: '1rem',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)',
                        },
                      }}
                    >
                      {user?.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                      sx: {
                        mt: 1.5,
                        minWidth: 200,
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2" fontWeight={600}>
                        {user?.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user?.email}
                      </Typography>
                    </Box>
                    {profileMenuItems.map((item) => (
                      <MenuItem
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText>{item.label}</ListItemText>
                      </MenuItem>
                    ))}
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon />
                      </ListItemIcon>
                      <ListItemText>Cerrar Sesión</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    size="small"
                    startIcon={<LoginIcon />}
                    sx={{ 
                      display: { xs: 'none', sm: 'flex' },
                      borderWidth: 2,
                      fontWeight: 600,
                    }}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    size="small"
                    sx={{
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                    }}
                  >
                    Registrarse
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <Typography variant="h6" sx={{ px: 2, mb: 2, fontWeight: 700, color: '#000000 !important' }}>
            IdolQuestions
          </Typography>
          <List>
            {navLinks.map((link) => (
              <ListItem
                key={link.path}
                component={Link}
                to={link.path}
                onClick={handleMobileMenuToggle}
                sx={{
                  color: isActive(link.path) ? 'primary.main' : 'text.primary',
                  backgroundColor: isActive(link.path) ? 'action.selected' : 'transparent',
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  {link.icon}
                </ListItemIcon>
                <ListItemText primary={link.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navigation;
