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
} from '@mui/material';
import Layout from '../components/Layout/Layout';

const TermsOfService: React.FC = () => {
  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom align="center">
          Terms of Service
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>

        <Card>
          <CardContent>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              1. Acceptance of Terms
            </Typography>
            <Typography variant="body1" paragraph>
              By accessing and using IdolQuestions, you accept and agree to be bound by the terms and provision of this agreement.
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" fontWeight={600} gutterBottom>
              2. Use License
            </Typography>
            <Typography variant="body1" paragraph>
              Permission is granted to temporarily access the materials (information or software) on IdolQuestions for personal, non-commercial transitory viewing only.
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" fontWeight={600} gutterBottom>
              3. Content Creator Responsibilities
            </Typography>
            <Typography variant="body1" paragraph>
              Content creators must:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Maintain verified Stripe accounts for payouts" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Create appropriate content that complies with Stripe's Acceptable Use Policy" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Provide accurate quiz answers and deliver digital content promptly" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Handle refunds and disputes professionally" />
              </ListItem>
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" fontWeight={600} gutterBottom>
              4. Prohibited Content
            </Typography>
            <Typography variant="body1" paragraph>
              The following content is strictly prohibited:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Adult or explicit content" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Hate speech or discriminatory content" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Illegal activities or services" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Copyright infringing material" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Misleading or fraudulent content" />
              </ListItem>
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" fontWeight={600} gutterBottom>
              5. Payment and Refunds
            </Typography>
            <Typography variant="body1" paragraph>
              All payments are processed through Stripe. Users may request refunds within 30 days of purchase for valid reasons including:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Non-delivery of digital content" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Incorrect or misleading quiz answers" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Technical issues preventing access" />
              </ListItem>
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" fontWeight={600} gutterBottom>
              6. Account Termination
            </Typography>
            <Typography variant="body1" paragraph>
              We reserve the right to terminate accounts that violate these terms or Stripe's policies. This includes but is not limited to:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="High dispute or chargeback rates" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Prohibited content creation" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Failure to maintain Stripe verification" />
              </ListItem>
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" fontWeight={600} gutterBottom>
              7. Limitation of Liability
            </Typography>
            <Typography variant="body1" paragraph>
              IdolQuestions shall not be held liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of our service.
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" fontWeight={600} gutterBottom>
              8. Governing Law
            </Typography>
            <Typography variant="body1" paragraph>
              These terms shall be interpreted and governed by the laws of the jurisdiction in which IdolQuestions operates.
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" fontWeight={600} gutterBottom>
              9. Changes to Terms
            </Typography>
            <Typography variant="body1" paragraph>
              We reserve the right to modify these terms at any time. Users will be notified of significant changes.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Layout>
  );
};

export default TermsOfService;
