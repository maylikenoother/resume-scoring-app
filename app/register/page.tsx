'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Paper } from '@mui/material';
import RegisterForm from '@/app/components/auth/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <RegisterForm />
      </Paper>
    </Container>
  );
}