"use client";

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});

  let token: string | undefined;

  if (typeof window !== "undefined") {
    const match = document.cookie.match(/(?:^|; )access_token=([^;]+)/);
    token = match?.[1];
  }

  if (!token && headers.has("x-auth-token")) {
    token = headers.get("x-auth-token") || undefined;
  }

  if (!token) {
    console.warn("No JWT token found in cookie or header.");
    throw new Error("No authentication token found");
  }

  headers.set("Authorization", `Bearer ${token}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });

    return response;
  } catch (error) {
    console.error(`fetchWithAuth error: ${url}`, error);
    throw error;
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  return document.cookie.includes("access_token=");
};
