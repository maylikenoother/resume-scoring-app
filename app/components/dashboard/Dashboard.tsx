'use client';
import { apiClient } from '@/app/utils/api-client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/components/AuthProvider';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CreditCard as CreditCardIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface Review {
  id: number;
  filename: string;
  status: string;
  created_at: string;
  updated_at: string;
  review_result: string | null;
  score: number | null;
}

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<{
    credits: number;
    reviews: Review[];
    notifications: Notification[];
  }>({
    credits: 0,
    reviews: [],
    notifications: [],
  });
  
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDashboardData = useCallback(async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      
      let credits = 0;
      try {
        const creditsData = await apiClient.get('credits/balance');
        credits = creditsData.balance;
      } catch (err) {
        console.error('Failed to fetch credits:', err);
      }
      
      let reviews = [];
      try {
        const reviewsData = await apiClient.get('reviews/?limit=5');
        reviews = reviewsData.reviews || [];
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
      
      let notifications = [];
      try {
        const notificationsData = await apiClient.get('notifications/?limit=5');
        notifications = notificationsData.notifications || [];
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
      
      setUserData({
        credits,
        reviews,
        notifications,
      });
    } catch (err: any) {
      setError('An error occurred while loading dashboard data. Please try again.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        fetchDashboardData();
      }
    }
  }, [isLoading, isAuthenticated, router, fetchDashboardData]);
  
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    const hasProcessingReviews = userData.reviews.some(review => review.status === 'processing');
    
    if (hasProcessingReviews && autoRefresh) {
      intervalId = setInterval(() => {
        fetchDashboardData(true);
      }, 5000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [userData.reviews, autoRefresh, fetchDashboardData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'processing':
        return <AccessTimeIcon color="primary" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      default:
        return <AccessTimeIcon color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'primary';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (isLoading || loading) {
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Credit Balance
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CreditCardIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h3" component="div" color="primary.main">
                {userData.credits}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Each CV review costs 1 credit.
            </Typography>
            <Box sx={{ mt: 'auto', pt: 2 }}>
              <Button
                variant="contained"
                onClick={() => router.push('/credits')}
                fullWidth
              >
                Purchase Credits
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => router.push('/upload')}
                  fullWidth
                  disabled={userData.credits < 1}
                >
                  Upload CV
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  startIcon={<NotificationsIcon />}
                  onClick={() => router.push('/notifications')}
                  fullWidth
                >
                  Notifications
                </Button>
              </Grid>
            </Grid>
            <Typography variant="body2" color="text.secondary">
              Upload your CV to get professional AI-powered feedback to improve your job prospects.
            </Typography>
            {userData.credits < 1 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                You need at least 1 credit to submit a CV for review.
              </Alert>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Reviews
              </Typography>
              <Box>
                <Tooltip title="Refresh">
                  <IconButton 
                    size="small" 
                    onClick={handleRefresh} 
                    disabled={refreshing}
                    sx={{ mr: 1 }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="text"
                  onClick={() => router.push('/reviews')}
                  size="small"
                >
                  View All
                </Button>
              </Box>
            </Box>
            
            {userData.reviews.length > 0 ? (
              <List>
                {userData.reviews.map((review, index) => (
                  <React.Fragment key={review.id}>
                    <ListItem
                      button
                      onClick={() => router.push(`/reviews/${review.id}`)}
                      sx={{ 
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                      }}
                    >
                      <ListItemIcon>
                        {getStatusIcon(review.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={review.filename}
                        secondary={`Submitted on ${formatDate(review.created_at)}`}
                      />
                      <Chip
                        label={review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                        color={getStatusColor(review.status) as any}
                        size="small"
                      />
                    </ListItem>
                    {index < userData.reviews.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  You haven't submitted any CVs for review yet.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => router.push('/upload')}
                  disabled={userData.credits < 1}
                >
                  Upload Your First CV
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Notifications
              </Typography>
              <Button
                variant="text"
                onClick={() => router.push('/notifications')}
                size="small"
              >
                View All
              </Button>
            </Box>
            
            {userData.notifications.length > 0 ? (
              <List>
                {userData.notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      sx={{
                        bgcolor: notification.is_read ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                        borderRadius: 1,
                      }}
                    >
                      <ListItemIcon>
                        <NotificationsIcon color={notification.is_read ? 'disabled' : 'primary'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={notification.message}
                        secondary={formatDate(notification.created_at)}
                      />
                    </ListItem>
                    {index < userData.notifications.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="text.secondary">
                  You Don&apos;t have any notifications yet.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}