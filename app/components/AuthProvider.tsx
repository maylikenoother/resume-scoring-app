/** Clear Review — polished blue product interface, calm hierarchy, practical feedback. */
'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { apiClient, SessionUser } from '@/app/utils/api-client';

type AuthContextValue = { isAuthenticated: boolean; isLoading: boolean; user: SessionUser | null; refreshSession: () => Promise<void>; logout: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);
  const refreshSession = useCallback(async () => { try { const session = await apiClient.getSession(); setUser(session.authenticated ? session.user : null); } catch { setUser(null); } finally { setIsLoading(false); } }, []);
  useEffect(() => { void refreshSession(); }, [refreshSession]);
  const logout = useCallback(async () => { await apiClient.logout(); setUser(null); }, []);
  return <AuthContext.Provider value={{ isAuthenticated: Boolean(user), isLoading, user, refreshSession, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used within AuthProvider'); return context; }
