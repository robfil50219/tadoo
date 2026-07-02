'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { firebaseEnabled } from '@/lib/config/firebase';
import { AppLanguage, useLanguage } from '@/lib/hooks/useLanguage';
import './AuthModal.scss';

const authCopy: Record<AppLanguage, {
  welcome: string;
  loginTitle: string;
  registerTitle: string;
  subtitle: string;
  email: string;
  password: string;
  confirmPassword: string;
  passwordMismatch: string;
  loading: string;
  loginButton: string;
  registerButton: string;
  noAccount: string;
  hasAccount: string;
  createAccount: string;
  demoNotice: string;
  credit: string;
  dayMode: string;
  nightMode: string;
}> = {
  en: {
    welcome: 'Welcome to Tadoo',
    loginTitle: 'Log in',
    registerTitle: 'Create account',
    subtitle: 'Family app for tasks, calendar and messages',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Repeat password',
    passwordMismatch: 'The passwords do not match.',
    loading: 'Loading...',
    loginButton: 'Log in',
    registerButton: 'Create account',
    noAccount: 'Do you not have an account?',
    hasAccount: 'Already have an account?',
    createAccount: 'Create account',
    demoNotice: 'Demo mode active: using local storage only.',
    credit: 'Built by Robert Filep',
    dayMode: 'Day mode',
    nightMode: 'Night mode',
  },
  no: {
    welcome: 'Velkommen til Tadoo',
    loginTitle: 'Logg inn',
    registerTitle: 'Opprett konto',
    subtitle: 'Familieapp for oppgaver, kalender og beskjeder',
    email: 'E-post',
    password: 'Passord',
    confirmPassword: 'Gjenta passord',
    passwordMismatch: 'Passordene er ikke like.',
    loading: 'Laster...',
    loginButton: 'Logg inn',
    registerButton: 'Opprett konto',
    noAccount: 'Har du ikke konto?',
    hasAccount: 'Har du konto fra før?',
    createAccount: 'Opprett konto',
    demoNotice: 'Demo-modus aktiv: bruker kun lokal lagring.',
    credit: 'Bygget av Robert Filep',
    dayMode: 'Dagmodus',
    nightMode: 'Nattmodus',
  },
  sv: {
    welcome: 'Välkommen till Tadoo',
    loginTitle: 'Logga in',
    registerTitle: 'Skapa konto',
    subtitle: 'Familjeapp för uppgifter, kalender och meddelanden',
    email: 'E-post',
    password: 'Losenord',
    confirmPassword: 'Upprepa lösenord',
    passwordMismatch: 'Lösenorden matchar inte.',
    loading: 'Laddar...',
    loginButton: 'Logga in',
    registerButton: 'Skapa konto',
    noAccount: 'Har du inget konto?',
    hasAccount: 'Har du redan ett konto?',
    createAccount: 'Skapa konto',
    demoNotice: 'Demoläge aktivt: använder endast lokal lagring.',
    credit: 'Byggt av Robert Filep',
    dayMode: 'Dagläge',
    nightMode: 'Nattläge',
  },
  da: {
    welcome: 'Velkommen til Tadoo',
    loginTitle: 'Log ind',
    registerTitle: 'Opret konto',
    subtitle: 'Familieapp til opgaver, kalender og beskeder',
    email: 'E-mail',
    password: 'Adgangskode',
    confirmPassword: 'Gentag adgangskode',
    passwordMismatch: 'Adgangskoderne er ikke ens.',
    loading: 'Indlæser...',
    loginButton: 'Log ind',
    registerButton: 'Opret konto',
    noAccount: 'Har du ikke en konto?',
    hasAccount: 'Har du allerede en konto?',
    createAccount: 'Opret konto',
    demoNotice: 'Demo-tilstand aktiv: bruger kun lokal lagring.',
    credit: 'Bygget af Robert Filep',
    dayMode: 'Dagtilstand',
    nightMode: 'Nattilstand',
  },
};

const languageOptions: Array<{ value: AppLanguage; label: string; flag: string }> = [
  { value: 'no', label: 'Norsk', flag: '🇳🇴' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { value: 'da', label: 'Dansk', flag: '🇩🇰' },
];

export default function AuthModal() {
  const [isLogin, setIsLogin] = useState(true);
  const [isNight, setIsNight] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const { signIn, register, loading, error } = useAuth();
  const { language, setLanguage } = useLanguage();
  const copy = authCopy[language];
  const selectedLanguage = languageOptions.find((option) => option.value === language) || languageOptions[0];

  const switchMode = (nextIsLogin: boolean) => {
    setLocalError('');
    setIsLogin(nextIsLogin);
  };

  const chooseLanguage = (nextLanguage: AppLanguage) => {
    setLanguage(nextLanguage);
    setIsLanguageMenuOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (isLogin) {
      await signIn(email, password);
    } else {
      if (password !== confirmPassword) {
        setLocalError(copy.passwordMismatch);
        return;
      }
      await register(email, password);
    }
  };

  return (
    <div className={`auth-modal ${isNight ? 'night-mode' : 'day-mode'}`}>
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

      <button
        type="button"
        className="scene-mode-toggle"
        aria-pressed={isNight}
        onClick={() => setIsNight((current) => !current)}
      >
        <span className="mode-indicator" aria-hidden="true"></span>
        {isNight ? copy.dayMode : copy.nightMode}
      </button>

      <div className="auth-container">
        <div className="language-menu">
          <button
            type="button"
            className="language-trigger"
            onClick={() => setIsLanguageMenuOpen((isOpen) => !isOpen)}
            aria-expanded={isLanguageMenuOpen}
            aria-haspopup="menu"
            aria-label="Choose language"
          >
            <span className="flag" aria-hidden="true">{selectedLanguage.flag}</span>
            <span>{selectedLanguage.label}</span>
          </button>

          {isLanguageMenuOpen && (
            <div className="language-options" role="menu" aria-label="Choose language">
              {languageOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={language === option.value ? 'active' : ''}
                  onClick={() => chooseLanguage(option.value)}
                  role="menuitemradio"
                  aria-checked={language === option.value}
                >
                  <span className="flag" aria-hidden="true">{option.flag}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="auth-header">
          <Image src="/images/tadoologo2.png" alt="Tadoo logo" width={128} height={128} priority />
          <p className="eyebrow">{copy.welcome}</p>
          <h1>{isLogin ? copy.loginTitle : copy.registerTitle}</h1>
          <p>{copy.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">{copy.email}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{copy.password}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">{copy.confirmPassword}</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {(localError || error) && <div className="error-message">{localError || error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? copy.loading : isLogin ? copy.loginButton : copy.registerButton}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isLogin ? copy.noAccount : copy.hasAccount}
            <button
              type="button"
              onClick={() => switchMode(!isLogin)}
              className="toggle-button"
            >
              {isLogin ? copy.createAccount : copy.loginButton}
            </button>
          </p>
        </div>

        {!firebaseEnabled && (
          <div className="demo-notice">
            <p>{copy.demoNotice}</p>
          </div>
        )}

        <p className="creator-credit">{copy.credit}</p>
      </div>
    </div>
  );
}
