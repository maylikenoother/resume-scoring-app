'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import NotificationList from '@/app/components/notifications/NotificationList';
import Navbar from '@/app/components/layout/Navbar';

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return null;
  }

  return (
    <Box>
      <Navbar />
      <NotificationList />
    </Box>
  );
}