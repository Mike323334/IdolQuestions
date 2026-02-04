import React from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  Grid,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout/Layout';

const ContentGuidelines: React.FC = () => {
  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom align="center">
          Content Guidelines
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Ensuring compliance with PayPal's Acceptable Use Policy
        </Typography>

        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Important:</strong> All quiz content must comply with PayPal's policies to avoid account suspension or termination.
          </Typography>
        </Alert>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              ✅ Permitted Content
            </Typography>
            <Typography variant="body1" paragraph>
              The following types of quiz content are allowed:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <List>
                  <ListItem>
                    <CheckIcon color="success" sx={{ mr: 1 }} />
                    <ListItemText primary="Entertainment and pop culture trivia" />
                  </ListItem>
                  <ListItem>
                    <CheckIcon color="success" sx={{ mr: 1 }} />
                    <ListItemText primary="Educational content and knowledge tests" />
                  </ListItem>
                  <ListItem>
                    <CheckIcon color="success" sx={{ mr: 1 }} />
                    <ListItemText primary="Sports and gaming quizzes" />
                  </ListItem>
                  <ListItem>
                    <CheckIcon color="success" sx={{ mr: 1 }} />
                    <ListItemText primary="General knowledge and trivia" />
                  </ListItem>
                </List>
              </Box>
              <Box sx={{ flex: 1 }}>
                <List>
                  <ListItem>
                    <CheckIcon color="success" sx={{ mr: 1 }} />
                    <ListItemText primary="Personality and fun assessment quizzes" />
                  </ListItem>
                  <ListItem>
                    <CheckIcon color="success" sx={{ mr: 1 }} />
                    <ListItemText primary="Creative and artistic content" />
                  </ListItem>
                  <ListItem>
                    <CheckIcon color="success" sx={{ mr: 1 }} />
                    <ListItemText primary="Professional skills and career quizzes" />
                  </ListItem>
                  <ListItem>
                    <CheckIcon color="success" sx={{ mr: 1 }} />
                    <ListItemText primary="Lifestyle and wellness content" />
                  </ListItem>
                </List>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3, borderColor: 'error.main', borderWidth: 2 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={600} gutterBottom color="error">
              🚫 STRICTLY PROHIBITED CONTENT
            </Typography>
            <Typography variant="body1" paragraph>
              The following content is <strong>absolutely forbidden</strong> and will result in immediate account suspension and potential legal action:
            </Typography>

            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600}>
                VIOLATION OF THESE RULES WILL RESULT IN PERMANENT ACCOUNT TERMINATION AND PAYPAL ACCOUNT RESTRICTIONS
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={600} color="error" gutterBottom>
                  Content Explicitly Banned:
                </Typography>
                <List dense>
                  <ListItem>
                    <CancelIcon color="error" sx={{ mr: 1 }} />
                    <ListItemText primary="Any content involving minors or children" />
                  </ListItem>
                  <ListItem>
                    <CancelIcon color="error" sx={{ mr: 1 }} />
                    <ListItemText primary="Exploitative or abusive content of any kind" />
                  </ListItem>
                  <ListItem>
                    <CancelIcon color="error" sx={{ mr: 1 }} />
                    <ListItemText primary="Copyright violations or infringing material" />
                  </ListItem>
                  <ListItem>
                    <CancelIcon color="error" sx={{ mr: 1 }} />
                    <ListItemText primary="Illegal content or promotion of illegal activities" />
                  </ListItem>
                  <ListItem>
                    <CancelIcon color="error" sx={{ mr: 1 }} />
                    <ListItemText primary="Content violating PayPal's Acceptable Use Policy" />
                  </ListItem>
                  <ListItem>
                    <CancelIcon color="error" sx={{ mr: 1 }} />
                    <ListItemText primary="Adult, explicit, or sexual content" />
                  </ListItem>
                  <ListItem>
                    <CancelIcon color="error" sx={{ mr: 1 }} />
                    <ListItemText primary="Hate speech, discrimination, or harassment" />
                  </ListItem>
                  <ListItem>
                    <CancelIcon color="error" sx={{ mr: 1 }} />
                    <ListItemText primary="Violence, graphic content, or threats" />
                  </ListItem>
                </List>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={600} color="error" gutterBottom>
                  Additional Prohibitions:
                </Typography>
                <List dense>
                  <ListItem>
                    <CancelIcon color="error" sx={{ mr: 1 }} />
                    <ListItemText primary="Fraudulent, misleading, or deceptive content" />
                  </ListItem>
                  <ListItem>
                    <CancelIcon color="error" sx={{ mr: 1 }} />
                    <ListItemText primary="Spam, repetitive, or low-quality content" />
                  </ListItem>
                  <ListItem>
                    <CancelIcon color="error" sx={{ mr: 1 }} />
                    <ListItemText primary="Political or religious propaganda" />
                  </ListItem>
                  <ListItem>
                    <CancelIcon color="error" sx={{ mr: 1 }} />
                    <ListItemText primary="Medical, health, or professional advice" />
                  </ListItem>
                  <ListItem>
                    <CancelIcon color="error" sx={{ mr: 1 }} />
                    <ListItemText primary="Content promoting harmful behaviors" />
                  </ListItem>
                  <ListItem>
                    <CancelIcon color="error" sx={{ mr: 1 }} />
                    <ListItemText primary="Impersonation or false representation" />
                  </ListItem>
                  <ListItem>
                    <CancelIcon color="error" sx={{ mr: 1 }} />
                    <ListItemText primary="Content that violates local laws" />
                  </ListItem>
                  <ListItem>
                    <CancelIcon color="error" sx={{ mr: 1 }} />
                    <ListItemText primary="Any content that could harm PayPal's reputation" />
                  </ListItem>
                </List>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              📋 Content Review Process
            </Typography>
            <Typography variant="body1" paragraph>
              All quiz content undergoes review to ensure compliance:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Automated content scanning for prohibited keywords and patterns" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Manual review for borderline content" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Community reporting system for violations" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Regular audits of existing content" />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              ⚖️ Consequences of Violations
            </Typography>
            <Typography variant="body1" paragraph>
              Non-compliance with these guidelines may result in:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Immediate content removal" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Temporary account suspension" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Permanent account termination" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Loss of all earnings and content" />
              </ListItem>
              <ListItem>
                <ListItemText primary="PayPal account restrictions" />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              📜 Creator Agreement Requirements
            </Typography>
            <Typography variant="body1" paragraph>
              All creators must agree to the following terms before publishing content:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Accept full responsibility for content accuracy and compliance" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Agree to immediate content removal upon violation detection" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Accept PayPal merchant account verification requirements" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Agree to content moderation and review processes" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Accept platform's right to terminate accounts for violations" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Agree to maintain proof of delivery for all transactions" />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              🔍 Content Moderation Enforcement
            </Typography>
            <Typography variant="body1" paragraph>
              We enforce strict content moderation through multiple layers:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Automated Systems:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="AI-powered content scanning for prohibited keywords" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Pattern recognition for exploitative content" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Copyright detection algorithms" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Real-time content analysis during creation" />
                  </ListItem>
                </List>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Manual Review:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Human review of flagged content" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Community reporting investigation" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Regular content audits" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Expert review for complex cases" />
                  </ListItem>
                </List>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              📦 Proof of Delivery Logs
            </Typography>
            <Typography variant="body1" paragraph>
              All digital content delivery is logged and tracked for compliance:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Transaction ID generation for every purchase" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Timestamped delivery confirmation" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Content access logging with user verification" />
              </ListItem>
              <ListItem>
                <ListItemText primary="PayPal order ID correlation" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Audit trail for dispute resolution" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Retention of delivery records for 7+ years" />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              🛡️ Best Practices for Creators
            </Typography>
            <Typography variant="body1" paragraph>
              Follow these guidelines to ensure your content remains compliant:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Keep questions and answers appropriate for all ages" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Avoid controversial or sensitive topics" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Use clear, unambiguous language" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Test your quiz for potential misinterpretation" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Regularly review and update your content" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Respond promptly to any content concerns" />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Container>
    </Layout>
  );
};

export default ContentGuidelines;
