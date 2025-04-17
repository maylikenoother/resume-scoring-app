'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function SessionSync() {
  const { data: session, status } = useSession();

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