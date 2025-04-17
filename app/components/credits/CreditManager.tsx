'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';

interface CreditBalance {
  id: number;
  user_id: number;
  balance: number;
  created_at: string;
  updated_at: string;
}

interface CreditTransaction {
  id: number;
  credit_balance_id: number;
  amount: number;
  description: string;
  transaction_type: string;
  created_at: string;
}

interface PricingTier {
  amount: number;
  price: number;
}

interface PricingTiers {
  basic: PricingTier;
  standard: PricingTier;
  premium: PricingTier;
}

export default function CreditManager() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [pricingTiers, setPricingTiers] = useState<PricingTiers | null>(null);

  useEffect(() => {
    fetchCreditData();
  }, []);

  const fetchCreditData = async () => {
    try {
      setLoading(true);

      const [balanceRes, transactionsRes, pricingRes] = await Promise.all([
        fetch('/api/py/credits/balance'),
        fetch('/api/py/credits/transactions'),
        fetch('/api/py/credits/pricing')
      ]);

      if (!balanceRes.ok || !transactionsRes.ok || !pricingRes.ok) {
        throw new Error('Failed to fetch credit data');
      }

      const balanceData = await balanceRes.json();
      const transactionsData = await transactionsRes.json();
      const pricingData = await pricingRes.json();

      setCreditBalance(balanceData);
      setTransactions(transactionsData);
      setPricingTiers(pricingData);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading credit data');
      console.error('Credits error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseCredits = async (tier: string) => {
    try {
      setPurchasing(tier);

      const response = await fetch('/api/py/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credit_amount: pricingTiers?.[tier as keyof PricingTiers]?.amount || 0 })
      });

      if (!response.ok) {
        throw new Error('Failed to purchase credits');
      }

      await fetchCreditData();

      alert(`Successfully purchased ${tier} credits package`);
    } catch (err: any) {
      setError(err.message || 'Failed to purchase credits');
      console.error('Purchase error:', err);
    } finally {
      setPurchasing(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
            <CreditCardIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography variant="h6" gutterBottom>
                Current Credit Balance
              </Typography>
              <Typography variant="h3" color="primary.main">
                {creditBalance?.balance || 0}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Purchase Credits
          </Typography>
          <Grid container spacing={3}>
            {pricingTiers && Object.entries(pricingTiers).map(([tier, { amount, price }]) => (
              <Grid item xs={12} sm={6} md={4} key={tier}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h5" component="div" gutterBottom sx={{ textTransform: 'capitalize' }}>
                      {tier} Package
                    </Typography>
                    <Typography variant="h4" color="primary.main">
                      {amount} Credits
                    </Typography>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {formatCurrency(price)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(price / amount)} per credit
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      variant="contained" 
                      fullWidth
                      onClick={() => handlePurchaseCredits(tier)}
                      disabled={purchasing === tier}
                    >
                      {purchasing === tier ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <>Purchase</>
                      )}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transaction History
            </Typography>
            
            {transactions.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.created_at)}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <Chip 
                            label={transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)} 
                            color={transaction.transaction_type === 'purchase' ? 'success' : transaction.transaction_type === 'usage' ? 'error' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ 
                          color: transaction.amount > 0 ? 'success.main' : 'error.main',
                          fontWeight: 'bold'
                        }}>
                          {transaction.amount > 0 ? (
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <AddIcon fontSize="small" />
                              {transaction.amount}
                            </Box>
                          ) : (
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <RemoveIcon fontSize="small" />
                              {Math.abs(transaction.amount)}
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="text.secondary">
                  No transaction history yet. Purchase some credits to get started.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}