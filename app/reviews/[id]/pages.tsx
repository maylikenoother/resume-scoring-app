'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";
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
  const { isLoaded, isSignedIn } = useAuth();
  const reviewId = parseInt(params.id);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return null;
  }

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