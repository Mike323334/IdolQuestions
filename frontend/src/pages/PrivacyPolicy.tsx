import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
} from '@mui/material';
import Layout from '../components/Layout/Layout';

const PrivacyPolicy: React.FC = () => {
  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Política de Privacidad
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Última actualización: {new Date().toLocaleDateString('es-ES')}
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              1. Información que Recopilamos
            </Typography>
            <Typography variant="body1" paragraph>
              En IdolQuestions, recopilamos la siguiente información:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
              <li>Información de cuenta: nombre de usuario, email, rol (Creador/Seguidor)</li>
              <li>Información de pago: procesada de forma segura por Stripe (no almacenamos datos de tarjetas)</li>
              <li>Contenido: preguntas, respuestas y cuestionarios que creas</li>
              <li>Datos de uso: interacciones con la plataforma, quizzes completados</li>
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              2. Cómo Usamos tu Información
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
              <li>Proporcionar y mejorar nuestros servicios</li>
              <li>Procesar pagos de forma segura</li>
              <li>Comunicarnos contigo sobre tu cuenta</li>
              <li>Prevenir fraudes y mantener la seguridad</li>
              <li>Cumplir con obligaciones legales</li>
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              3. Compartir Información
            </Typography>
            <Typography variant="body1" paragraph>
              No vendemos tu información personal. Compartimos información solo cuando:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
              <li>Es necesario para proporcionar el servicio (ej: Stripe para pagos)</li>
              <li>Tienes tu consentimiento explícito</li>
              <li>Es requerido por ley</li>
              <li>Es necesario para proteger nuestros derechos legales</li>
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              4. Seguridad de Datos
            </Typography>
            <Typography variant="body1" paragraph>
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
              <li>Encriptación HTTPS para todas las comunicaciones</li>
              <li>Autenticación Firebase para acceso seguro</li>
              <li>Stripe para procesamiento seguro de pagos (PCI DSS compliant)</li>
              <li>Webhooks verificados criptográficamente</li>
              <li>Monitoreo de seguridad y alertas automáticas</li>
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              5. Tus Derechos (GDPR/CCPA)
            </Typography>
            <Typography variant="body1" paragraph>
              Tienes derecho a:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
              <li>Acceder a tu información personal</li>
              <li>Rectificar información incorrecta</li>
              <li>Eliminar tu cuenta y datos</li>
              <li>Portabilidad de datos</li>
              <li>Oponerte al procesamiento</li>
              <li>Retirar el consentimiento</li>
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              6. Cookies y Tecnologías Similares
            </Typography>
            <Typography variant="body1" paragraph>
              Usamos cookies y tecnologías similares para:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
              <li>Mantener tu sesión iniciada</li>
              <li>Recordar tus preferencias</li>
              <li>Analizar el uso de la plataforma</li>
              <li>Mejorar la experiencia del usuario</li>
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              7. Contacto
            </Typography>
            <Typography variant="body1" paragraph>
              Para preguntas sobre esta política de privacidad o para ejercer tus derechos, contacta:
            </Typography>
            <Typography variant="body1">
              Email: privacy@idolquestions.com<br />
              Dirección: [Tu dirección comercial]
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="h5" gutterBottom>
              8. Cambios a esta Política
            </Typography>
            <Typography variant="body1" paragraph>
              Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios significativos 
              por email o mediante un aviso en la plataforma.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
};

export default PrivacyPolicy;