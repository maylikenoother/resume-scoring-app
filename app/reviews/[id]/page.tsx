'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Alert } from '@mui/material';
import ReviewDetail from '@/app/components/cv/ReviewDetail';
import Navbar from '@/app/components/layout/Navbar';

interface ReviewDetailPageProps {
  params: {
    id: string;
  };
}

export default function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  const router = useRouter();
  // Access the ID safely
  const id = params?.id || '';
  const reviewId = parseInt(id);

  const [authState, setAuthState] = useState({
    checked: false,
    isAuthenticated: false
  });

  useEffect(() => {
    // This effect should only run once on mount
    const tokenExists = document.cookie.includes('access_token=');
    
    setAuthState({
      checked: true,
      isAuthenticated: tokenExists
    });

    if (!tokenExists) {
      router.push('/login');
    }
  }, [router]); // Only depends on router

  if (!authState.checked) return null;

  if (isNaN(reviewId)) {
    return (
      <Box>
        <Navbar />
        <Container>
          <Box sx={{ mt: 4 }}>
            <Alert severity="error">Invalid review ID</Alert>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <Container>
        <ReviewDetail reviewId={reviewId} />
      </Container>
    </Box>
  );
}