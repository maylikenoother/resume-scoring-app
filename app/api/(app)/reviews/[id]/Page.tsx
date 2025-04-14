'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container } from '@mui/material';
import ReviewDetail from '@/app/components/cv/ReviewDetail';
import Navbar from '@/app/components/layout/Navbar';

interface ReviewDetailPageProps {
  params: {
    id: string;
  };
}

export default function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const reviewId = parseInt(params.id);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return null; // or a loading spinner
  }

  // Handle invalid ID
  if (isNaN(reviewId)) {
    return (
      <Box>
        <Navbar />
        <Container>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            Invalid review ID
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