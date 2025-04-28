'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider, 
  Chip, 
  Button, 
  CircularProgress, 
  Alert 
} from '@mui/material';
import Navbar from '@/app/components/layout/Navbar';
import { 
  CloudUpload as CloudUploadIcon, 
  AccessTime as AccessTimeIcon, 
  CheckCircle as CheckCircleIcon, 
  Error as ErrorIcon 
} from '@mui/icons-material';

interface Review {
  id: number;
  filename: string;
  status: string;
  created_at: string;
}

export default function ReviewsPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        fetchReviews();
      } else {
        router.push('/login');
      }
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/py/reviews', {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.status}`);
      }

      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
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

  if (!isLoaded || loading) {
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
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            My CV Reviews
          </Typography>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => router.push('/upload')}
          >
            Upload New CV
          </Button>
        </Box>

        <Paper>
          {reviews.length > 0 ? (
            <List>
              {reviews.map((review, index) => (
                <React.Fragment key={review.id}>
                  <ListItem
                    button
                    onClick={() => router.push(`/reviews/${review.id}`)}
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
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={() => router.push('/upload')}
              >
                Upload CV
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}