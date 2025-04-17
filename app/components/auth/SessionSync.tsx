'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Box } from '@mui/material';

export default function SessionSync() {
  const { data: session, status } = useSession();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      localStorage.setItem('token', session.accessToken);
      console.log('Token synced to localStorage');
    } else if (status === 'unauthenticated') {
      localStorage.removeItem('token');
      console.log('Token removed from localStorage');
    }
  }, [session, status]);

  return null;
}