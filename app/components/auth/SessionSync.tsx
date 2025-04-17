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
    } else if (status === 'unauthenticated') {
      localStorage.removeItem('token');
    }
  }, [session, status]);

  return null;
}