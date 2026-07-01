'use client';

import { useEffect, useState } from 'react';
import { firebaseEnabled } from '@/lib/config/firebase';

export interface AppUser {
  id: string;
  email?: string;
  name?: string;
  isDemo: boolean;
}

const demoUser: AppUser = {
  id: 'demo-user',
  email: 'demo@example.com',
  name: 'Demo User',
  isDemo: true,
};

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(demoUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!firebaseEnabled) {
        throw new Error('Firebase not configured');
      }
      // Firebase sign in logic will be added here
      // For now, set user to demo
      setUser({ ...demoUser, email });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!firebaseEnabled) {
        throw new Error('Firebase not configured');
      }
      // Firebase registration logic will be added here
      setUser({ ...demoUser, email });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    register,
    logout,
  };
}
