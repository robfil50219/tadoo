'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useAuth } from '@/lib/hooks/useAuth';
import { firebaseEnabled } from '@/lib/config/firebase';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { useThemeMode } from '@/lib/hooks/useThemeMode';
import {
  fadeInUpVariants,
  modalBackdropVariants,
  modalPanelVariants,
  subtleButtonHover,
  subtleButtonTap,
} from '@/lib/animations';
import LanguageSwitcher from './LanguageSwitcher';
import AuthSceneCanvas from './AuthSceneCanvas';
import './AuthModal.scss';

export default function AuthModal() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { signIn, register, loading, error } = useAuth();
  const { t } = useLanguage();
  const { isNight, toggleThemeMode } = useThemeMode();

  const switchMode = (nextIsLogin: boolean) => {
    setLocalError('');
    setIsLogin(nextIsLogin);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (isLogin) {
      await signIn(email, password);
    } else {
      if (password !== confirmPassword) {
        setLocalError(t('auth.passwordMismatch'));
        return;
      }
      await register(email, password);
    }
  };

  return (
    <motion.div
      className={`auth-modal ${isNight ? 'night-mode' : 'day-mode'}`}
      variants={modalBackdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <AuthSceneCanvas isNight={isNight} />
      <div className="auth-scene" aria-hidden="true">
        <span className="sun"></span>
        <span className="moon"></span>
        <span className="starfield starfield-one"></span>
        <span className="starfield starfield-two"></span>
        <span className="starfield starfield-three"></span>
        <span className="constellation constellation-orion">
          <span className="constellation-point orion-star-one"></span>
          <span className="constellation-point orion-star-two"></span>
          <span className="constellation-point orion-star-three"></span>
          <span className="constellation-point orion-star-four"></span>
          <span className="constellation-point orion-star-five"></span>
          <span className="constellation-point orion-star-six"></span>
          <span className="constellation-point orion-star-seven"></span>
        </span>
        <span className="constellation constellation-cassiopeia">
          <span className="constellation-point cassiopeia-star-one"></span>
          <span className="constellation-point cassiopeia-star-two"></span>
          <span className="constellation-point cassiopeia-star-three"></span>
          <span className="constellation-point cassiopeia-star-four"></span>
          <span className="constellation-point cassiopeia-star-five"></span>
        </span>
        <span className="constellation constellation-ursa-major">
          <span className="constellation-point ursa-star-one"></span>
          <span className="constellation-point ursa-star-two"></span>
          <span className="constellation-point ursa-star-three"></span>
          <span className="constellation-point ursa-star-four"></span>
          <span className="constellation-point ursa-star-five"></span>
          <span className="constellation-point ursa-star-six"></span>
          <span className="constellation-point ursa-star-seven"></span>
        </span>
        <span className="shooting-star shooting-star-one"></span>
        <span className="shooting-star shooting-star-two"></span>
        <span className="cloud cloud-one"></span>
        <span className="cloud cloud-two"></span>
        <span className="balloon">
          <span className="balloon-lantern"></span>
        </span>
        <span className="tree tree-right">
          <span className="tree-trunk"></span>
          <span className="tree-canopy canopy-back"></span>
          <span className="tree-canopy canopy-left"></span>
          <span className="tree-canopy canopy-center"></span>
          <span className="tree-canopy canopy-right"></span>
        </span>
        <span className="ball"></span>
        <span className="person adult-one"></span>
        <span className="person adult-two"></span>
        <span className="person child-one"></span>
        <span className="person child-two"></span>
        <span className="tent">
          <span className="tent-light"></span>
          <span className="tent-door"></span>
          <span className="lantern lantern-left"></span>
          <span className="lantern lantern-right"></span>
        </span>
        <span className="campfire">
          <span className="flame flame-back"></span>
          <span className="flame flame-front"></span>
          <span className="ember ember-one"></span>
          <span className="ember ember-two"></span>
          <span className="ember ember-three"></span>
        </span>
        <span className="ground"></span>
      </div>

      <motion.button
        type="button"
        className="scene-mode-toggle"
        {...(isNight ? { 'aria-pressed': 'true' } : { 'aria-pressed': 'false' })}
        onClick={toggleThemeMode}
        whileTap={subtleButtonTap(shouldReduceMotion)}
        whileHover={subtleButtonHover(shouldReduceMotion)}
      >
        <span className="mode-indicator" aria-hidden="true"></span>
        {isNight ? t('auth.nightMode') : t('auth.dayMode')}
      </motion.button>

      <motion.div
        className="auth-container"
        variants={modalPanelVariants(shouldReduceMotion)}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <LanguageSwitcher className="auth-language-switcher" menuPlacement="top" />

        <div className="auth-header">
          <Image src="/images/tadoologo2.png" alt="Tadoo logo" width={128} height={128} priority />
          <p className="eyebrow">{t('auth.welcome')}</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.h1
              key={isLogin ? 'login-title' : 'register-title'}
              variants={fadeInUpVariants(shouldReduceMotion)}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
            </motion.h1>
          </AnimatePresence>
          <p>{t('auth.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <AnimatePresence initial={false}>
            {!isLogin && (
              <motion.div
                className="form-group"
                variants={fadeInUpVariants(shouldReduceMotion)}
                initial="hidden"
                animate="visible"
              exit="exit"
            >
                <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {(localError || error) && (
              <motion.div
                className="error-message"
                variants={fadeInUpVariants(shouldReduceMotion)}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {localError || error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="auth-button"
            disabled={loading}
            whileTap={loading ? undefined : subtleButtonTap(shouldReduceMotion)}
            whileHover={loading ? undefined : subtleButtonHover(shouldReduceMotion)}
          >
            {loading ? t('common.loading') : isLogin ? t('auth.loginButton') : t('auth.registerButton')}
          </motion.button>
        </form>

        <div className="auth-toggle">
          <p>
            {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
            <motion.button
              type="button"
              onClick={() => switchMode(!isLogin)}
              className="toggle-button"
              whileTap={subtleButtonTap(shouldReduceMotion)}
            >
              {isLogin ? t('auth.createAccount') : t('auth.loginButton')}
            </motion.button>
          </p>
        </div>

        {!firebaseEnabled && (
          <div className="demo-notice">
            <p>{t('auth.demoNotice')}</p>
          </div>
        )}

        <p className="creator-credit">{t('auth.credit')}</p>
      </motion.div>
    </motion.div>
  );
}
