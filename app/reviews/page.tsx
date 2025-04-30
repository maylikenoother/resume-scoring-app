// app/reviews/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/components/AuthProvider';
import { 
  Box, Container, Typography, Paper, List, ListItem, ListItemText, ListItemIcon, Divider, Chip, Button, CircularProgress, Alert 
} from '@mui/material';
import Navbar from '@/app/components/layout/Navbar';
import { 
  CloudUpload as CloudUploadIcon, AccessTime as AccessTimeIcon, CheckCircle as CheckCircleIcon, Error as ErrorIcon 
} from '@mui/icons-material';
import { apiClient } from '@/app/utils/api-client';
import { getAuthToken } from '@/app/utils/auth';

interface Review {
  id: number;
  filename: string;
  status: string;
  created_at: string;
}

export default function ReviewsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        fetchReviews();
      }
    }
  }, [isLoading, isAuthenticated, router]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Debug: Check if token exists before making the request
      const token = getAuthToken();
      if (!token) {
        console.error("No auth token found before fetching reviews");
        router.push('/login');
        return;
      }
      
      // Add a query parameter to prevent caching issues
      const timestamp = new Date().getTime();
      const data = await apiClient.get(`reviews?_t=${timestamp}`);
      setReviews(data.reviews || []);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      
      // Check if the error is unauthorized (401)
      if (err.status === 401) {
        console.log("Unauthorized error when fetching reviews. Redirecting to login.");
        router.push('/login');
        return;
      }
      
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon color="success" />;
      case 'processing': return <AccessTimeIcon color="primary" />;
      case 'failed': return <ErrorIcon color="error" />;
      default: return <AccessTimeIcon color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'primary';
      case 'failed': return 'error';
      default: return 'default';
    }
  };
  
  const handleUploadClick = () => {
    // Check authentication again before navigation
    if (isAuthenticated) {
      router.push('/upload');
    } else {
      router.push('/login');
    }
  };
  
  const handleReviewClick = (reviewId: number) => {
    // Check authentication again before navigation
    if (isAuthenticated) {
      router.push(`/reviews/${reviewId}`);
    } else {
      router.push('/login');
    }
  };

  if (isLoading || loading) {
    return (
      <Box>
        <Navbar />
        <Container sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">My CV Reviews</Typography>
          <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={handleUploadClick}>
            Upload New CV
          </Button>
        </Box>

        <Paper>
          {reviews.length > 0 ? (
            <List>
              {reviews.map((review, index) => (
                <React.Fragment key={review.id}>
                  <ListItem button onClick={() => handleReviewClick(review.id)}>
                    <ListItemIcon>{getStatusIcon(review.status)}</ListItemIcon>
                    <ListItemText primary={review.filename} secondary={`Submitted on ${formatDate(review.created_at)}`} />
                    <Chip label={review.status.charAt(0).toUpperCase() + review.status.slice(1)} color={getStatusColor(review.status) as any} size="small" />
                  </ListItem>
                  {index < reviews.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No CV Reviews Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload your first CV to get professional AI-powered feedback.
              </Typography>
              <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={handleUploadClick}>
                Upload CV
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}