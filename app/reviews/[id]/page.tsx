'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Container, Alert } from '@mui/material';
import ReviewDetail from '@/app/components/cv/ReviewDetail';
import Navbar from '@/app/components/layout/Navbar';

export default function ReviewDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const reviewId = parseInt(id);

  const [authState, setAuthState] = useState({
    checked: false,
    isAuthenticated: false
  });

  useEffect(() => {
    const tokenExists = document.cookie.includes('access_token=');
    
    setAuthState({
      checked: true,
      isAuthenticated: tokenExists
    });

    if (!tokenExists) {
      router.push('/login');
    }
  }, [router]);

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
