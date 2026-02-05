import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Send as SendIcon,
  History as HistoryIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../contexts/AuthContext';

interface RefundRequest {
  id: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  adminNote?: string;
}

const RefundRequests: React.FC = () => {
  const { user } = useAuth();
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<string>('');
  const [reason, setReason] = useState('');
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadRefundRequests();
      loadUserTransactions();
    }
  }, [user]);

  const loadRefundRequests = () => {
    const requests = JSON.parse(localStorage.getItem('refundRequests') || '[]');
    const userRequests = requests.filter((req: RefundRequest) => req.userId === user?.id);
    setRefundRequests(userRequests);
  };

  const loadUserTransactions = () => {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const userTxns = transactions.filter((txn: any) => txn.buyerId === user?.id);
    setUserTransactions(userTxns);
  };

  const handleSubmitRefundRequest = () => {
    if (!selectedTransaction || !reason.trim()) {
      setError('Please select a transaction and provide a reason for the refund request.');
      return;
    }

    const transaction = userTransactions.find(txn => txn.id === selectedTransaction);
    if (!transaction) {
      setError('Selected transaction not found.');
      return;
    }

    // Check if refund request already exists for this transaction
    const existingRequest = refundRequests.find(req => req.quizId === transaction.quizId);
    if (existingRequest) {
      setError('A refund request already exists for this transaction.');
      return;
    }

    const newRequest: RefundRequest = {
      id: Date.now().toString(),
      userId: user!.id,
      quizId: transaction.quizId,
      quizTitle: transaction.quizTitle,
      amount: transaction.amount,
      reason: reason.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const requests = JSON.parse(localStorage.getItem('refundRequests') || '[]');
    requests.push(newRequest);
    localStorage.setItem('refundRequests', JSON.stringify(requests));

    setRefundRequests([...refundRequests, newRequest]);
    setSelectedTransaction('');
    setReason('');
    setSubmitDialogOpen(false);
    setSuccess('Refund request submitted successfully. You will be notified of the decision.');
    setError('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <ApprovedIcon color="success" />;
      case 'rejected':
        return <RejectedIcon color="error" />;
      default:
        return <PendingIcon color="warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom align="center">
          Refund Requests
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Request refunds for quiz purchases or view your refund history
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        {/* Submit Refund Request */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              <SendIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Request a Refund
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You can request a refund within 30 days of purchase if you haven't accessed the quiz answers.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl fullWidth>
                <InputLabel>Select Transaction</InputLabel>
                <Select
                  value={selectedTransaction}
                  onChange={(e) => setSelectedTransaction(e.target.value)}
                  label="Select Transaction"
                >
                  {userTransactions.map((txn) => (
                    <MenuItem key={txn.id} value={txn.id}>
                      {txn.quizTitle} - ${txn.amount} ({new Date(txn.createdAt).toLocaleDateString()})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                onClick={() => setSubmitDialogOpen(true)}
                disabled={!selectedTransaction}
              >
                Request Refund
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Refund History */}
        <Card>
          <CardContent>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Refund History
            </Typography>

            {refundRequests.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No refund requests found.
              </Typography>
            ) : (
              <List>
                {refundRequests.map((request) => (
                  <ListItem key={request.id} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(request.status)}
                          <Typography variant="subtitle1" fontWeight={600}>
                            {request.quizTitle}
                          </Typography>
                          <Chip
                            label={request.status.toUpperCase()}
                            color={getStatusColor(request.status) as any}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Amount: ${request.amount} | Requested: {new Date(request.createdAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Reason: {request.reason}
                          </Typography>
                          {request.adminNote && (
                            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                              Admin Note: {request.adminNote}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Submit Refund Dialog */}
        <Dialog
          open={submitDialogOpen}
          onClose={() => setSubmitDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Submit Refund Request</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Please provide a detailed reason for your refund request:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you are requesting a refund..."
              sx={{ mt: 2 }}
            />
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Refund requests are reviewed within 3-5 business days. Approved refunds will be processed back to your original payment method.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSubmitDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmitRefundRequest}
              variant="contained"
              disabled={!reason.trim()}
            >
              Submit Request
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default RefundRequests;
