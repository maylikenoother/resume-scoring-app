'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";
import { Box } from '@mui/material';
import NotificationList from '@/app/components/notifications/NotificationList';
import Navbar from '@/app/components/layout/Navbar';

export default function NotificationsPage() {
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
      <NotificationList />
    </Box>
  );
}