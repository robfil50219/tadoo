'use client';

import { useEffect } from 'react';
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Unsubscribe,
  type User,
} from 'firebase/auth';
import { create } from 'zustand';
import { firebaseConfig, firebaseEnabled } from '@/lib/config/firebase';

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

interface AuthStoreState {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  initialize: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

let authUnsubscribe: Unsubscribe | null = null;

const getFirebaseAuth = () => {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
};

const userFromFirebase = (user: User): AppUser => ({
  id: user.uid,
  email: user.email || undefined,
  name: user.displayName || user.email || 'Tadoo user',
  isDemo: false,
});

const useAuthStore = create<AuthStoreState>((set) => ({
  user: firebaseEnabled ? null : demoUser,
  loading: firebaseEnabled,
  error: null,

  initialize: () => {
    if (!firebaseEnabled || authUnsubscribe) return;

    set({ loading: true, error: null });
    authUnsubscribe = onAuthStateChanged(
      getFirebaseAuth(),
      (firebaseUser) => {
        set({
          user: firebaseUser ? userFromFirebase(firebaseUser) : null,
          loading: false,
          error: null,
        });
      },
      (error) => {
        set({
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication failed',
        });
      }
    );
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      if (firebaseEnabled) {
        await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      } else {
        set({ user: { ...demoUser, email }, loading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Authentication failed',
        loading: false,
      });
    }
  },

  register: async (email, password) => {
    set({ loading: true, error: null });
    try {
      if (firebaseEnabled) {
        await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      } else {
        set({ user: { ...demoUser, email }, loading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Registration failed',
        loading: false,
      });
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      if (firebaseEnabled) {
        await signOut(getFirebaseAuth());
      } else {
        set({ user: null });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Sign out failed' });
    } finally {
      set({ loading: false });
    }
  },
}));

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const initialize = useAuthStore((state) => state.initialize);
  const signIn = useAuthStore((state) => state.signIn);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    user,
    loading,
    error,
    signIn,
    register,
    logout,
  };
}
