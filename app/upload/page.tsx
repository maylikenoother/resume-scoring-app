'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/components/AuthProvider';
import { Box, Container, CircularProgress, Alert } from '@mui/material';
import UploadForm from '@/app/components/cv/UploadForm';
import Navbar from '@/app/components/layout/Navbar';
import { apiClient } from '@/app/utils/api-client';

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [credits, setCredits] = useState(0);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        fetchCredits();
      }
    }
  }, [isLoading, isAuthenticated, router]);

  const fetchCredits = async () => {
    try {
      const data = await apiClient.get('credits/balance');
      setCredits(data.balance);
    } catch (err) {
      console.error('Error fetching credits:', err);
      setError('Failed to fetch credits');
    } finally {
      setLoadingCredits(false);
    }
  };

  if (isLoading || loadingCredits) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
        <UploadForm credits={credits} />
      </Container>
    </Box>
  );
}
