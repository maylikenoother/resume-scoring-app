'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";
import { Box } from '@mui/material';
import CreditManager from '@/app/components/credits/CreditManager';
import Navbar from '@/app/components/layout/Navbar';

export default function CreditsPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return null;
  }

  return (
    <Box>
      <Navbar />
      <CreditManager />
    </Box>
  );
}