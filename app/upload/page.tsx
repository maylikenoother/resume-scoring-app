'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";
import { Box, Container } from '@mui/material';
import UploadForm from '@/app/components/cv/UploadForm';
import Navbar from '@/app/components/layout/Navbar';

export default function UploadPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        fetchCredits();
      } else {
        router.push('/login');
      }
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/py/credits/balance');
      if (response.ok) {
        const data = await response.json();
        setCredits(data.balance);
      }
    } catch (err) {
      console.error('Error fetching credits:', err);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <Box>
      <Navbar />
      <Container>
        <UploadForm credits={credits} />
      </Container>
    </Box>
  );
}