/** Clear Review — polished blue product interface, calm hierarchy, practical feedback. */
'use client';

import Link from 'next/link';
import { ArrowBackRounded, AutoAwesomeRounded, DescriptionOutlined } from '@mui/icons-material';
import { Box, Chip, Container, IconButton, Paper, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

type AuthShellProps = { children: ReactNode; eyebrow: string; title: string; subtitle: string };

export default function AuthShell({ children, eyebrow, title, subtitle }: AuthShellProps) {
  return <Box sx={{ minHeight: '100vh', py: { xs: 2, sm: 4 }, background: 'radial-gradient(circle at 8% 4%, #E8EEFF 0, transparent 34%), linear-gradient(145deg, #F7F9FC 0%, #FFFFFF 55%, #EEF3FF 100%)' }}><Container maxWidth="sm"><Stack spacing={{ xs: 3, sm: 4 }}><Stack direction="row" alignItems="center" justifyContent="space-between"><Stack component={Link} href="/" direction="row" spacing={1.25} alignItems="center" sx={{ textDecoration: 'none' }}><Box sx={{ width: 38, height: 38, borderRadius: 2.5, display: 'grid', placeItems: 'center', color: 'primary.contrastText', background: 'linear-gradient(145deg, #3265EF, #163A9A)' }}><DescriptionOutlined fontSize="small" /></Box><Typography fontWeight={800} letterSpacing="-0.03em">CV Review</Typography></Stack><IconButton component={Link} href="/" aria-label="Return to CV Review home" sx={{ color: 'text.secondary' }}><ArrowBackRounded /></IconButton></Stack><Paper elevation={0} sx={{ overflow: 'hidden', border: '1px solid', borderColor: 'divider', boxShadow: '0 24px 60px rgba(28, 55, 123, 0.10)' }}><Box sx={{ px: { xs: 3, sm: 5 }, py: { xs: 3.5, sm: 5 }, background: 'linear-gradient(135deg, #163A9A, #2454D7 58%, #3F76F6)', color: 'primary.contrastText' }}><Chip icon={<AutoAwesomeRounded />} label={eyebrow} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: 'inherit', '& .MuiChip-icon': { color: 'inherit' }, mb: 2 }} /><Typography variant="h3" sx={{ mb: 1 }}>{title}</Typography><Typography sx={{ opacity: 0.82, maxWidth: 420 }}>{subtitle}</Typography></Box><Box sx={{ px: { xs: 3, sm: 5 }, py: { xs: 3.5, sm: 4.5 } }}>{children}</Box></Paper><Typography variant="body2" color="text.secondary" align="center">Your account keeps your CV feedback and progress in one place.</Typography></Stack></Container></Box>;
}
