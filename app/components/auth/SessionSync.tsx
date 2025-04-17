'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { CircularProgress, Box } from '@mui/material';

export default function SessionSync() {
  const { data: session, status } = useSession();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && !syncing && session?.accessToken) {
      const syncSession = async () => {
        try {
          setSyncing(true);
          
          const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error('Failed to sync session with backend');
          }
          
          const data = await response.json();
          
          if (data.access_token) {
            localStorage.setItem('token', data.access_token);
          }
          
        } catch (error) {
          console.error('Session sync error:', error);
        } finally {
          setSyncing(false);
        }
      };
      
      syncSession();
    }
  }, [session, status, syncing]);

  if (syncing) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2000,
          height: '3px',
          bgcolor: 'transparent',
        }}
      >
        <LinearProgress />
      </Box>
    );
  }

  return null;
}

function LinearProgress() {
  return (
    <Box
      sx={{
        width: '100%',
        height: '3px',
        bgcolor: 'primary.main',
        backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
        backgroundSize: '200% 100%',
        animation: 'progress 2s infinite linear',
        '@keyframes progress': {
          '0%': {
            backgroundPosition: '200% 0',
          },
          '100%': {
            backgroundPosition: '-200% 0',
          },
        },
      }}
    />
  );
}