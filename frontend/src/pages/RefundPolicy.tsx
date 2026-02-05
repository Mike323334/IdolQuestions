import React from 'react';
import {
  Typography,
  Container,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
} from '@mui/material';
import Layout from '../components/Layout/Layout';

const RefundPolicy: React.FC = () => {
  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom align="center">
          Refund Policy
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Important:</strong> This refund policy is designed to comply with PayPal's policies and reduce dispute rates.
          </Typography>
        </Alert>

        <Card>
          <CardContent>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              1. Refund Eligibility
            </Typography>
            <Typography variant="body1" paragraph>
              Refunds may be requested within 30 days of purchase for the following valid reasons:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Non-delivery of quiz answers after payment" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Incorrect or misleading quiz answers" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Technical issues preventing access to purchased content" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Duplicate or accidental purchases" />
              </ListItem>
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" fontWeight={600} gutterBottom>
              2. Refund Process
            </Typography>
            <Typography variant="body1" paragraph>
              To request a refund:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Contact the content creator directly with proof of purchase" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Provide specific details about the issue" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Include transaction ID and timestamp" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Allow 5-7 business days for review and processing" />
              </ListItem>
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" fontWeight={600} gutterBottom>
              3. Non-Refundable Items
            </Typography>
            <Typography variant="body1" paragraph>
              The following are not eligible for refunds:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Purchases made more than 30 days ago" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Change of mind or buyer's remorse" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Disagreement with quiz answers (subjective opinions)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Technical issues on the buyer's device" />
              </ListItem>
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" fontWeight={600} gutterBottom>
              4. Proof of Delivery
            </Typography>
            <Typography variant="body1" paragraph>
              IdolQuestions maintains detailed logs of all digital content delivery:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Payment confirmation timestamps" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Content unlock timestamps" />
              </ListItem>
              <ListItem>
                <ListItemText primary="User access logs" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Transaction IDs and metadata" />
              </ListItem>
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" fontWeight={600} gutterBottom>
              5. Dispute Resolution
            </Typography>
            <Typography variant="body1" paragraph>
              If you cannot resolve an issue with the content creator:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Contact IdolQuestions support with all relevant details" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Provide screenshots and transaction information" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Allow 48 hours for initial response" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Escalation to PayPal dispute resolution if necessary" />
              </ListItem>
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" fontWeight={600} gutterBottom>
              6. PayPal Dispute Prevention
            </Typography>
            <Typography variant="body1" paragraph>
              To minimize PayPal disputes and chargebacks:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="All transactions are logged with timestamps" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Digital content is delivered immediately after payment" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Clear refund policies are communicated before purchase" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Creators maintain verified PayPal merchant accounts" />
              </ListItem>
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" fontWeight={600} gutterBottom>
              7. Contact Information
            </Typography>
            <Typography variant="body1" paragraph>
              For refund requests or disputes, contact:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Email: support@quizthreads.com" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Response time: Within 48 hours" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Required information: Transaction ID, quiz details, issue description" />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Container>
    </Layout>
  );
};

export default RefundPolicy;
