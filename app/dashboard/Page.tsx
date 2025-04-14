'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import Dashboard from '@/app/components/dashboard/Dashboard';
import Navbar from '@/app/components/layout/Navbar';

export default function DashboardPage() {
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
      <Dashboard />
    </Box>
  );
}