/** Clear Review — polished blue product interface, calm hierarchy, practical feedback. */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Box, CircularProgress, Container } from '@mui/material';
import UploadForm from '@/app/components/cv/UploadForm';
import Navbar from '@/app/components/layout/Navbar';
import { apiClient } from '@/app/utils/api-client';
import { useAuth } from '@/app/components/AuthProvider';

type CreditResponse = { balance: number };
export default function UploadPage() {
  const router = useRouter(); const { isAuthenticated, isLoading } = useAuth(); const [credits, setCredits] = useState(0); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const loadCredits = useCallback(async () => { try { const response = await apiClient.get<CreditResponse>('credits/balance'); setCredits(response.balance); } catch (cause) { setError(cause instanceof Error ? cause.message : 'We could not load your credit balance.'); } finally { setLoading(false); } }, []);
  useEffect(() => { if (!isLoading && !isAuthenticated) router.replace('/login?from=/upload'); if (!isLoading && isAuthenticated) void loadCredits(); }, [isAuthenticated, isLoading, loadCredits, router]);
  if (isLoading || loading) return <Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>;
  return <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}><Navbar /><Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>{error ? <Alert severity="error">{error}</Alert> : <UploadForm credits={credits} />}</Container></Box>;
}
