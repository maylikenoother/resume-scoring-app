'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, getUserData, removeAuthToken, getAuthToken } from '@/app/utils/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: number;
    email: string;
    fullName: string;
  } | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null as any,
  });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const userData = getUserData();
      
      setAuthState({
        isAuthenticated: authenticated,
        isLoading: false,
        user: authenticated && userData ? {
          id: userData.id,
          email: userData.email,
          fullName: userData.full_name,
        } : null,
      });
      
      // For debugging
      console.log("Auth check:", {
        authenticated,
        token: getAuthToken()?.substring(0, 15) + "...",
        userData
      });
    };

    checkAuth();
  }, [pathname]);

  const logout = () => {
    removeAuthToken();
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        user: authState.user,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}