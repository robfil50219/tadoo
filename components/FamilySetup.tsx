'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useTodoStore } from '@/lib/store/todoStore';
import type { AppUser } from '@/lib/hooks/useAuth';
import { fadeInUpVariants, subtleButtonHover, subtleButtonTap } from '@/lib/animations';
import './FamilySetup.scss';

interface FamilySetupProps {
  user: AppUser;
}

type SetupMode = 'create' | 'join';

export default function FamilySetup({ user }: FamilySetupProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const { createFamilyForUser, joinFamilyByCode, familyLoading, familyError } = useTodoStore();
  const [mode, setMode] = useState<SetupMode>('create');
  const [familyName, setFamilyName] = useState('');
  const [displayName, setDisplayName] = useState(user.name || '');
  const [inviteCode, setInviteCode] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('invite') || params.get('code');
    if (codeFromUrl) {
      setInviteCode(codeFromUrl.toUpperCase());
      setMode('join');
    }
  }, []);

  const submitCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError('');

    if (!familyName.trim() || !displayName.trim()) {
      setLocalError('Skriv inn familienavn og ditt navn.');
      return;
    }

    try {
      await createFamilyForUser(user, familyName, displayName);
    } catch {
      // Store-level error is shown below the form.
    }
  };

  const submitJoin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError('');

    if (!inviteCode.trim() || !displayName.trim()) {
      setLocalError('Skriv inn invitasjonskode og ditt navn.');
      return;
    }

    try {
      await joinFamilyByCode(user, inviteCode, displayName);
    } catch {
      // Store-level error is shown below the form.
    }
  };

  return (
    <main className="family-setup">
      <motion.section
        className="setup-card"
        variants={fadeInUpVariants(shouldReduceMotion)}
        initial="hidden"
        animate="visible"
      >
        <Image src="/images/tadoologo2.png" alt="Tadoo logo" width={118} height={118} priority />
        <p className="eyebrow">Velkommen til Tadoo</p>
        <h1>Sett opp familien din</h1>
        <p>
          Opprett en ny familie eller bli med i en eksisterende familie med invitasjonskode.
          Data lagres trygt i Firebase og synkroniseres mellom familiemedlemmer.
        </p>

        <div className="setup-tabs">
          <motion.button
            type="button"
            className={mode === 'create' ? 'active' : ''}
            onClick={() => setMode('create')}
            whileTap={subtleButtonTap(shouldReduceMotion)}
          >
            Opprett familie
          </motion.button>
          <motion.button
            type="button"
            className={mode === 'join' ? 'active' : ''}
            onClick={() => setMode('join')}
            whileTap={subtleButtonTap(shouldReduceMotion)}
          >
            Bli med
          </motion.button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {mode === 'create' ? (
            <motion.form
              key="create-family"
              className="setup-form"
              onSubmit={submitCreate}
              variants={fadeInUpVariants(shouldReduceMotion)}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <label htmlFor="familyName">Familienavn</label>
              <input
                id="familyName"
                value={familyName}
                onChange={(event) => setFamilyName(event.target.value)}
                placeholder="F.eks. Familien Hansen"
                required
              />

              <label htmlFor="displayName">Ditt navn</label>
              <input
                id="displayName"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Navnet familien ser"
                required
              />

              {(localError || familyError) && (
                <p className="setup-error">{localError || familyError}</p>
              )}

              <motion.button
                type="submit"
                disabled={familyLoading}
                whileTap={familyLoading ? undefined : subtleButtonTap(shouldReduceMotion)}
                whileHover={familyLoading ? undefined : subtleButtonHover(shouldReduceMotion)}
              >
                {familyLoading ? 'Oppretter...' : 'Opprett familie'}
              </motion.button>
            </motion.form>
          ) : (
            <motion.form
              key="join-family"
              className="setup-form"
              onSubmit={submitJoin}
              variants={fadeInUpVariants(shouldReduceMotion)}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <label htmlFor="inviteCode">Invitasjonskode</label>
              <input
                id="inviteCode"
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                placeholder="ABC12345"
                required
              />

              <label htmlFor="joinDisplayName">Ditt navn</label>
              <input
                id="joinDisplayName"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Navnet familien ser"
                required
              />

              {(localError || familyError) && (
                <p className="setup-error">{localError || familyError}</p>
              )}

              <motion.button
                type="submit"
                disabled={familyLoading}
                whileTap={familyLoading ? undefined : subtleButtonTap(shouldReduceMotion)}
                whileHover={familyLoading ? undefined : subtleButtonHover(shouldReduceMotion)}
              >
                {familyLoading ? 'Kobler til...' : 'Bli med i familie'}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.section>
    </main>
  );
}
