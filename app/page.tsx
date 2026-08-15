/** Clear Review — confident cobalt hierarchy, direct review outcomes, and no decorative step numbering. */
'use client';

import { useRouter } from 'next/navigation';
import { ArrowForwardRounded, AutoAwesomeRounded, ChecklistRounded, DescriptionOutlined, InsightsRounded, ShieldOutlined, UploadFileRounded } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, Container, Grid, Stack, Typography } from '@mui/material';
import Navbar from './components/layout/Navbar';
import { useAuth } from './components/AuthProvider';

const steps = [
  { icon: <UploadFileRounded />, title: 'Upload a readable CV', copy: 'Send a PDF or document when you are ready for a focused review.' },
  { icon: <AutoAwesomeRounded />, title: 'Analyse the evidence', copy: 'The workspace combines a quality signal with structured feedback on the information already in your CV.' },
  { icon: <ChecklistRounded />, title: 'Prioritise the edits', copy: 'Keep each review in one place and work through the changes that will matter most next.' },
];

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const destination = isAuthenticated ? '/upload' : '/register';

  return <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}><Navbar /><Box component="main">
    <Box sx={{ pt: { xs: 7, md: 11 }, pb: { xs: 7, md: 12 }, overflow: 'hidden', background: 'radial-gradient(circle at 84% 15%, rgba(113, 145, 244, .30) 0, transparent 24%), radial-gradient(circle at 10% 86%, rgba(37, 79, 199, .08) 0, transparent 28%), linear-gradient(145deg, #FFFFFF, #F2F5FF)' }}>
      <Container maxWidth="lg"><Grid container spacing={{ xs: 5, md: 7 }} alignItems="center"><Grid item xs={12} md={7}><Stack spacing={3} alignItems="flex-start">
        <Chip icon={<AutoAwesomeRounded />} label="Evidence-led CV feedback" sx={{ bgcolor: 'primary.light', color: 'primary.dark', '& .MuiChip-icon': { color: 'primary.main' } }} />
        <Typography variant="h1" sx={{ fontSize: { xs: '3rem', sm: '4.5rem', md: '5.3rem' }, maxWidth: 690 }}>See the signal in <Box component="span" sx={{ color: 'primary.main' }}>your experience.</Box></Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, maxWidth: 585, lineHeight: 1.65 }}>Upload your CV and receive a structured review that separates what is already working from the edits worth making next.</Typography>
        {!isLoading && <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}><Button variant="contained" size="large" endIcon={<ArrowForwardRounded />} onClick={() => router.push(destination)}>{isAuthenticated ? 'Start a new review' : 'Create your account'}</Button>{!isAuthenticated && <Button variant="text" size="large" onClick={() => router.push('/login')}>I already have an account</Button>}</Stack>}
      </Stack></Grid><Grid item xs={12} md={5}><Card elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderTop: '3px solid #254FC7', boxShadow: '0 24px 60px rgba(35, 67, 163, .14)' }}><CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, '&:last-child': { pb: { xs: 2.5, sm: 3.5 } } }}><Stack spacing={2.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between"><Stack direction="row" spacing={1} alignItems="center"><Box sx={{ p: 1, bgcolor: 'primary.light', color: 'primary.main', borderRadius: 2 }}><DescriptionOutlined /></Box><Box><Typography fontWeight={800}>Your review workspace</Typography><Typography variant="body2" color="text.secondary">Clear feedback, retained securely</Typography></Box></Stack><ShieldOutlined color="primary" /></Stack>
        <Box sx={{ p: 2.2, borderRadius: 3, bgcolor: '#F4F6FC', border: '1px solid #E5EAF6' }}><Typography variant="overline" color="primary.main" fontWeight={800}>The review surface</Typography><Stack spacing={1.25} mt={1}>{['A structured quality signal', 'Skills and experience observations', 'Specific edits to prioritise'].map((item) => <Stack key={item} direction="row" spacing={1.1} alignItems="center"><InsightsRounded fontSize="small" color="primary" /><Typography variant="body2">{item}</Typography></Stack>)}</Stack></Box>
        <Typography variant="body2" color="text.secondary">You remain in control of every change. The app creates the review trail; you decide what belongs in your CV.</Typography>
      </Stack></CardContent></Card></Grid></Grid></Container>
    </Box>
    <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}><Stack spacing={1.5} sx={{ mb: 4.5 }}><Typography color="primary.main" fontWeight={800}>A practical review process</Typography><Typography variant="h2" sx={{ fontSize: { xs: '2.15rem', md: '3rem' }, maxWidth: 650 }}>Good feedback should give you a clearer decision, not another vague to-do list.</Typography></Stack><Grid container spacing={2.5}>{steps.map((step) => <Grid item xs={12} md={4} key={step.title}><Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider', transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease', '&:hover': { transform: 'translateY(-4px)', borderColor: '#AFC0F6', boxShadow: '0 18px 38px rgba(32, 60, 148, .10)' } }}><CardContent sx={{ p: 3.25 }}><Box sx={{ width: 44, height: 44, display: 'grid', placeItems: 'center', color: 'primary.main', bgcolor: 'primary.light', borderRadius: 2.5, mb: 3 }}>{step.icon}</Box><Typography variant="h6" sx={{ mb: 1 }}>{step.title}</Typography><Typography color="text.secondary" sx={{ lineHeight: 1.65 }}>{step.copy}</Typography></CardContent></Card></Grid>)}</Grid></Container>
  </Box><Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', py: 3.5 }}><Container maxWidth="lg"><Typography variant="body2" color="text.secondary">CV Review · Structured feedback for your next application.</Typography></Container></Box></Box>;
}
