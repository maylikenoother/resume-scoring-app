'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Typography,
  Alert,
} from '@mui/material';
import { GitHub as GitHubIcon, Google as GoogleIcon } from '@mui/icons-material';

export default function SignIn() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Sign In
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error === 'OAuthSignin' && 'Error starting OAuth sign in'}
            {error === 'OAuthCallback' && 'Error during OAuth callback'}
            {error === 'OAuthCreateAccount' && 'Error creating OAuth account'}
            {error === 'EmailCreateAccount' && 'Error creating email account'}
            {error === 'Callback' && 'Error during callback'}
            {error === 'OAuthAccountNotLinked' && 'Email already in use with different provider'}
            {error === 'SessionRequired' && 'Please sign in to access this page'}
            {error === 'Default' && 'Unable to sign in'}
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            my: 2,
          }}
        >
          <Button
            variant="contained"
            startIcon={<GitHubIcon />}
            fullWidth
            onClick={() => signIn('github', { callbackUrl })}
            sx={{ 
              bgcolor: '#24292e',
              '&:hover': { bgcolor: '#1a1e22' },
              py: 1.5
            }}
          >
            Sign in with GitHub
          </Button>

          <Button
            variant="contained"
            startIcon={<GoogleIcon />}
            fullWidth
            onClick={() => signIn('google', { callbackUrl })}
            sx={{ 
              bgcolor: '#4285F4',
              '&:hover': { bgcolor: '#3367D6' },
              py: 1.5
            }}
          >
            Sign in with Google
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}