'use client';

import { useSearchParams } from 'next/navigation';
import { Alert, Box, Button, Container, Paper, Typography } from '@mui/material';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have access to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      default:
        return 'An unexpected error occurred during authentication.';
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Authentication Error
        </Typography>

        <Alert severity="error" sx={{ my: 3 }}>
          {getErrorMessage(error)}
        </Alert>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button component={Link} href="/auth/signin" variant="contained">
            Try Again
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}