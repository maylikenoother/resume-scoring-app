'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container } from '@mui/material';
import UploadForm from '@/app/components/cv/UploadForm';
import Navbar from '@/app/components/layout/Navbar';

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);

  // Check authentication and get credit balance
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch credit balance
    fetch('/api/py/credits/balance', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch credits');
        return response.json();
      })
      .then(data => {
        setCredits(data.balance);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching credits:', err);
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return null; // or a loading spinner
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