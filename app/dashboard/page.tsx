'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import Dashboard from '@/app/components/dashboard/Dashboard';
import Navbar from '@/app/components/layout/Navbar';
import { useAuth } from '@/app/components/AuthProvider';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return null;
  }

  return (
    <Box>
      <Navbar />
      <Dashboard />
    </Box>
  );
}