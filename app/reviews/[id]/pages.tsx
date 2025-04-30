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
  const reviewId = parseInt(params.id);

  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const tokenExists = document.cookie.includes('access_token=');
    setIsAuthenticated(tokenExists);
    setAuthChecked(true);

    if (!tokenExists) {
      router.push('/login');
    }
  }, [router]);

  if (!authChecked) return null;

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
