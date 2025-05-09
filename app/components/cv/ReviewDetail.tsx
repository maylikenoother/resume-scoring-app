'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/components/AuthProvider';
import ReactMarkdown from 'react-markdown';
import { apiClient } from '@/app/utils/api-client';
import {
  Box, Paper, Typography, Chip, CircularProgress, Alert, Button, Divider, Grid, LinearProgress, Card, CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface ReviewDetailProps {
  reviewId: number;
}

interface Review {
  id: number;
  filename: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
  review_result: string | null;
  score: number | null;
}

export default function ReviewDetail({ reviewId }: ReviewDetailProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [review, setReview] = useState<Review | null>(null);

  const fetchReviewData = useCallback(async () => {
    try {
      const data = await apiClient.get(`reviews/${reviewId}`);
      setReview(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Review detail error:', err);
      setError(err.message || 'An error occurred while loading review data');
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        fetchReviewData();
      }
    }
  }, [reviewId, isLoading, isAuthenticated, router, fetchReviewData]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    
    if (review?.status === 'processing') {
      intervalId = setInterval(() => {
        apiClient.get(`reviews/${reviewId}`)
          .then(data => {
            setReview(data);
          })
          .catch(err => console.error('Polling error:', err));
      }, 5000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [review, reviewId]);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'primary';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'processing': return <AccessTimeIcon />;
      case 'failed': return <ErrorIcon />;
      default: return <AccessTimeIcon />;
    }
  };

  if (isLoading || loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  }

  if (!review) {
    return <Alert severity="info" sx={{ mt: 4 }}>Review not found</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/reviews')} sx={{ mr: 2 }}>Back to Reviews</Button>
        <Typography variant="h5" component="h1">Review Details</Typography>
      </Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Typography variant="h6">{review.filename}</Typography>
            <Typography variant="body2" color="text.secondary">Submitted on {formatDate(review.created_at)}</Typography>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: { sm: 'right' } }}>
            <Chip icon={getStatusIcon(review.status)} label={review.status.charAt(0).toUpperCase() + review.status.slice(1)} color={getStatusColor(review.status) as any} />
          </Grid>
        </Grid>
        {review.status === 'processing' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">Your CV is being analyzed. This may take a few minutes. The page will update automatically when complete.</Typography>
            <LinearProgress sx={{ mt: 1 }} />
          </Box>
        )}
        {review.status === 'failed' && (
          <Alert severity="error" sx={{ mt: 2 }}>There was an error processing your CV review. Please try uploading again.</Alert>
        )}
      </Paper>
      {review.status === 'completed' && review.review_result && (
        <Grid container spacing={3}>
          {review.score !== null && (
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">CV Score</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
                    <Typography variant="h2" sx={{ color: review.score >= 7 ? 'success.main' : review.score >= 5 ? 'warning.main' : 'error.main' }}>{review.score.toFixed(1)}/10</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
          <Grid item xs={12} md={review.score !== null ? 8 : 12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Review Feedback</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ '& a': { color: 'primary.main' }, '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 2, mb: 1, fontWeight: 'fontWeightMedium' }, '& ul, & ol': { pl: 3 } }}>
                <ReactMarkdown>{review.review_result}</ReactMarkdown>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}