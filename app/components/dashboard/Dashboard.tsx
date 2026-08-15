/** Clear Review — polished blue product interface, calm hierarchy, practical feedback. */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowForwardRounded, AutoAwesomeRounded, CheckCircleRounded, DescriptionOutlined, ErrorOutlineRounded, RefreshRounded, UploadFileRounded } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Container, Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { apiClient } from '@/app/utils/api-client';
import { useAuth } from '@/app/components/AuthProvider';

type Review = { id: number; filename: string; status: 'completed' | 'processing' | 'failed' | string; created_at: string; score: number | null };
type DashboardData = { credits: number; reviews: Review[] };
type CreditResponse = { balance: number };
type ReviewResponse = { reviews: Review[] };

const statusStyle = (status: Review['status']) => status === 'completed' ? { label: 'Ready', color: '#12805C', background: '#E7F7F0' } : status === 'failed' ? { label: 'Needs attention', color: '#B42318', background: '#FEEDEC' } : { label: 'In review', color: '#2454D7', background: '#E8EEFF' };

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [data, setData] = useState<DashboardData>({ credits: 0, reviews: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true); setError('');
    try {
      const [creditResult, reviewResult] = await Promise.all([apiClient.get<CreditResponse>('credits/balance'), apiClient.get<ReviewResponse>('reviews/?limit=4')]);
      setData({ credits: creditResult.balance, reviews: reviewResult.reviews ?? [] });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'We could not load your workspace. Please try again.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { if (!isLoading && !isAuthenticated) router.replace('/login?from=/dashboard'); if (!isLoading && isAuthenticated) void load(); }, [isAuthenticated, isLoading, load, router]);
  if (isLoading || loading) return <Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>;

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  return <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}><Stack spacing={4}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}><Box><Typography color="primary.main" fontWeight={800}>YOUR WORKSPACE</Typography><Typography variant="h2" sx={{ fontSize: { xs: '2.4rem', md: '3.25rem' }, mt: 0.5 }}>Hello, {firstName}.</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Review your progress and decide what to improve next.</Typography></Box><Button variant="contained" startIcon={<UploadFileRounded />} onClick={() => router.push('/upload')}>Upload a CV</Button></Stack>
    {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void load()}>Try again</Button>}>{error}</Alert>}
    <Grid container spacing={2.5}><Grid item xs={12} md={4}><Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider', background: 'linear-gradient(145deg, #FFFFFF, #F4F7FF)' }}><CardContent sx={{ p: 3.25 }}><Typography color="text.secondary" fontWeight={700}>Review credits</Typography><Stack direction="row" alignItems="baseline" spacing={1} mt={1.5}><Typography variant="h2" color="primary.main">{data.credits}</Typography><Typography color="text.secondary">available</Typography></Stack><Typography variant="body2" color="text.secondary" sx={{ mt: 2.5, mb: 2 }}>One credit gives you one structured CV review.</Typography><Button variant="text" endIcon={<ArrowForwardRounded />} onClick={() => router.push('/credits')}>Manage credits</Button></CardContent></Card></Grid>
    <Grid item xs={12} md={8}><Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}><CardContent sx={{ p: 3.25 }}><Stack direction="row" alignItems="center" justifyContent="space-between"><Box><Typography color="text.secondary" fontWeight={700}>Your next review</Typography><Typography variant="h6" sx={{ mt: 0.5 }}>{data.credits > 0 ? 'Ready whenever you are.' : 'Add a credit to begin.'}</Typography></Box><Box sx={{ p: 1.4, borderRadius: 2.5, bgcolor: 'primary.light', color: 'primary.main' }}><AutoAwesomeRounded /></Box></Stack><Typography color="text.secondary" sx={{ mt: 1.4, mb: 2.5 }}>Upload the version you are working on. We will keep the result with your previous feedback.</Typography><Button variant="outlined" onClick={() => router.push(data.credits > 0 ? '/upload' : '/credits')}>{data.credits > 0 ? 'Choose a CV' : 'View credits'}</Button></CardContent></Card></Grid></Grid>
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}><CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}><Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.25 }}><Box><Typography variant="h6">Recent reviews</Typography><Typography variant="body2" color="text.secondary">Your latest feedback, in one place.</Typography></Box><Tooltip title="Refresh"><IconButton onClick={() => void load(true)} disabled={refreshing} aria-label="Refresh reviews"><RefreshRounded /></IconButton></Tooltip></Stack>
    {data.reviews.length === 0 ? <Box sx={{ textAlign: 'center', py: 5, border: '1px dashed', borderColor: 'divider', borderRadius: 3, bgcolor: '#FBFCFE' }}><DescriptionOutlined sx={{ color: 'primary.main', fontSize: 34 }} /><Typography fontWeight={750} sx={{ mt: 1.5 }}>Your first review will appear here.</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, mb: 2 }}>Start with the CV version you are actively refining.</Typography><Button variant="contained" size="small" onClick={() => router.push('/upload')}>Upload a CV</Button></Box> : <Stack spacing={1.25}>{data.reviews.map((review) => { const status = statusStyle(review.status); return <Box key={review.id} onClick={() => router.push(`/reviews/${review.id}`)} sx={{ cursor: 'pointer', px: 2, py: 1.75, display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: 3, bgcolor: '#FBFCFE', transition: 'background 160ms ease', '&:hover': { bgcolor: '#F0F4FF' } }}><Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main' }}><DescriptionOutlined fontSize="small" /></Box><Box sx={{ minWidth: 0, flex: 1 }}><Typography noWrap fontWeight={750}>{review.filename}</Typography><Typography variant="body2" color="text.secondary">Submitted {new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Typography></Box>{review.score !== null && <Typography fontWeight={800} color="primary.main" sx={{ display: { xs: 'none', sm: 'block' } }}>{review.score}%</Typography>}<Chip label={status.label} size="small" sx={{ color: status.color, bgcolor: status.background, fontWeight: 750 }} /></Box>; })}</Stack>}</CardContent></Card>
  </Stack></Container>;
}
