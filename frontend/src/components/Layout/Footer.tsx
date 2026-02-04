import React from 'react';
import { Box, Container, Typography, Link, Stack } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.02) 0%, transparent 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            © {new Date().getFullYear()} IdolQuestions. All rights reserved.
          </Typography>
          
            <Stack direction="row" spacing={4}>
            <Link
              href="/content-guidelines"
              color="text.secondary"
              underline="hover"
              variant="body2"
              sx={{
                fontWeight: 500,
                transition: 'all 0.2s',
                '&:hover': {
                  color: 'primary.main',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Content Guidelines
            </Link>
            <Link
              href="/terms-of-service"
              color="text.secondary"
              underline="hover"
              variant="body2"
              sx={{
                fontWeight: 500,
                transition: 'all 0.2s',
                '&:hover': {
                  color: 'primary.main',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Terms of Service
            </Link>
            <Link
              href="/refund-policy"
              color="text.secondary"
              underline="hover"
              variant="body2"
              sx={{
                fontWeight: 500,
                transition: 'all 0.2s',
                '&:hover': {
                  color: 'primary.main',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Refund Policy
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
