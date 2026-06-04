'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore();

  useEffect(() => {
    // Sync auth store state with cookies for middleware access
    if (accessToken) {
      const refreshToken = useAuthStore.getState().refreshToken;
      // Store the access token directly in the cookie for easy middleware access
      document.cookie = `auth=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}`;
      document.cookie = `refresh=${refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}`;
    } else {
      // Clear cookies on logout
      document.cookie = 'auth=; path=/; max-age=0';
      document.cookie = 'refresh=; path=/; max-age=0';
    }
  }, [accessToken]);

  return <>{children}</>;
}
