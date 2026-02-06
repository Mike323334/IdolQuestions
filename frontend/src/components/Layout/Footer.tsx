import React from 'react';
import { Box, Container, Typography, Link as MuiLink, Divider } from '@mui/material';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
            © {new Date().getFullYear()} IdolQuestions. Todos los derechos reservados.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <MuiLink
              component={Link}
              to="/privacy-policy"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                textDecoration: 'none',
                '&:hover': {
                  color: '#ffffff',
                  textDecoration: 'underline',
                },
              }}
            >
              Política de Privacidad
            </MuiLink>
            
            <Typography variant="body2" color="rgba(255, 255, 255, 0.3)">
              |
            </Typography>
            
            <MuiLink
              href="mailto:support@idolquestions.com"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                textDecoration: 'none',
                '&:hover': {
                  color: '#ffffff',
                  textDecoration: 'underline',
                },
              }}
            >
              Contacto
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;