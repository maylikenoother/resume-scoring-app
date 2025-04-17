// app/upload/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Box, Container } from '@mui/material';
import UploadForm from '@/app/components/cv/UploadForm';
import Navbar from '@/app/components/layout/Navbar';

export default function UploadPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      fetch('/api/py/credits/balance', {
        headers: { 'Authorization': `Bearer ${session.accessToken}` }
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch credits');
          return response.json();
        })
        .then(data => {
          setCredits(data.balance);
        })
        .catch(err => {
          console.error('Error fetching credits:', err);
        });
    }
  }, [status, session]);

  if (status === "loading") {
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