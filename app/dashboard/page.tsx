'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Box } from '@mui/material';
import Dashboard from '@/app/components/dashboard/Dashboard';
import Navbar from '@/app/components/layout/Navbar';

export default function DashboardPage() {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  if (status === "loading") {
    return null;
  }

  return (
    <Box>
      <Navbar />
      <Dashboard />
    </Box>
  );
}