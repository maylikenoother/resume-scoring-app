'use client';

import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Box, Button, Container, Paper, Typography, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function SignOut() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: '/' });
  };

  const handleCancel = () => {
    router.back();
  };

  if (isSigningOut) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 3 }} />
          <Typography>Signing out...</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Sign Out
        </Typography>
        <Typography paragraph sx={{ mb: 4 }}>
          Are you sure you want to sign out?
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSignOut}>
            Sign Out
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}