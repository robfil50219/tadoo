'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useTodoStore } from '@/lib/store/todoStore';
import type { AppUser } from '@/lib/hooks/useAuth';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { useThemeMode } from '@/lib/hooks/useThemeMode';
import { fadeInUpVariants, subtleButtonHover, subtleButtonTap } from '@/lib/animations';
import './FamilySetup.scss';

interface FamilySetupProps {
  user: AppUser;
}

type SetupMode = 'create' | 'join';

export default function FamilySetup({ user }: FamilySetupProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const { createFamilyForUser, joinFamilyByCode, familyLoading, familyError } = useTodoStore();
  const { t } = useLanguage();
  const { isNight } = useThemeMode();
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
      setLocalError(t('familySetup.missingCreateFields'));
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
      setLocalError(t('familySetup.missingJoinFields'));
      return;
    }

    try {
      await joinFamilyByCode(user, inviteCode, displayName);
    } catch {
      // Store-level error is shown below the form.
    }
  };

  return (
    <main className={`family-setup ${isNight ? 'night-mode' : 'day-mode'}`}>
      <motion.section
        className="setup-card"
        variants={fadeInUpVariants(shouldReduceMotion)}
        initial="hidden"
        animate="visible"
      >
        <Image src="/images/tadoologo2.png" alt="Tadoo logo" width={118} height={118} priority />
        <p className="eyebrow">{t('familySetup.eyebrow')}</p>
        <h1>{t('familySetup.title')}</h1>
        <p>{t('familySetup.description')}</p>

        <div className="setup-tabs">
          <motion.button
            type="button"
            className={mode === 'create' ? 'active' : ''}
            onClick={() => setMode('create')}
            whileTap={subtleButtonTap(shouldReduceMotion)}
          >
            {t('familySetup.createTab')}
          </motion.button>
          <motion.button
            type="button"
            className={mode === 'join' ? 'active' : ''}
            onClick={() => setMode('join')}
            whileTap={subtleButtonTap(shouldReduceMotion)}
          >
            {t('familySetup.joinTab')}
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
              <label htmlFor="familyName">{t('familySetup.familyName')}</label>
              <input
                id="familyName"
                value={familyName}
                onChange={(event) => setFamilyName(event.target.value)}
                placeholder={t('familySetup.familyNamePlaceholder')}
                required
              />

              <label htmlFor="displayName">{t('familySetup.displayName')}</label>
              <input
                id="displayName"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder={t('familySetup.displayNamePlaceholder')}
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
                {familyLoading ? t('familySetup.creating') : t('familySetup.createButton')}
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
              <label htmlFor="inviteCode">{t('familySetup.inviteCode')}</label>
              <input
                id="inviteCode"
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                placeholder={t('familySetup.inviteCodePlaceholder')}
                required
              />

              <label htmlFor="joinDisplayName">{t('familySetup.displayName')}</label>
              <input
                id="joinDisplayName"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder={t('familySetup.displayNamePlaceholder')}
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
                {familyLoading ? t('familySetup.joining') : t('familySetup.joinButton')}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.section>
    </main>
  );
}
