'use client';

import { useEffect } from 'react';
import { useTodoStore } from '@/lib/store/todoStore';
import type { AppUser } from '@/lib/hooks/useAuth';

export function useFamilySync(user: AppUser | null) {
  const state = useTodoStore((store) => store.state);
  const familyLoading = useTodoStore((store) => store.familyLoading);
  const familyError = useTodoStore((store) => store.familyError);
  const connectRemoteUser = useTodoStore((store) => store.connectRemoteUser);
  const disconnectRemoteUser = useTodoStore((store) => store.disconnectRemoteUser);
  const userEmail = user?.email;
  const userId = user?.id;
  const userIsDemo = user?.isDemo;
  const userName = user?.name;

  useEffect(() => {
    if (!userId) {
      disconnectRemoteUser();
      return undefined;
    }

    const unsubscribe = connectRemoteUser({
      id: userId,
      email: userEmail,
      isDemo: userIsDemo,
      name: userName,
    });
    return () => unsubscribe?.();
  }, [connectRemoteUser, disconnectRemoteUser, userEmail, userId, userIsDemo, userName]);

  return {
    state,
    familyLoading,
    familyError,
    needsFamilySetup: Boolean(user && !familyLoading && !state.isSetupComplete),
  };
}
