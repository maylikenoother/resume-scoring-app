// app/utils/auth-helpers.ts
import { auth } from "@clerk/nextjs/server";

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const { getToken } = await auth();
  const token = await getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  
  try {
    return await fetch(url, {
      ...options,
      headers,
      cache: 'no-store',
    });
  } catch (error) {
    console.error(`Auth fetch error for ${url}:`, error);
    throw error;
  }
};

export const isAuthenticated = async () => {
  const { userId } = await auth();
  return !!userId;
};