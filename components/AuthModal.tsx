'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { firebaseEnabled } from '@/lib/config/firebase';
import './AuthModal.scss';

export default function AuthModal() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { signIn, register, loading, error } = useAuth();

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
        setLocalError('Passordene er ikke like.');
        return;
      }
      await register(email, password);
    }
  };

  return (
    <div className="auth-modal">
      <div className="auth-scene" aria-hidden="true">
        <span className="sun"></span>
        <span className="cloud cloud-one"></span>
        <span className="cloud cloud-two"></span>
        <span className="balloon"></span>
        <span className="ball"></span>
        <span className="person adult-one"></span>
        <span className="person adult-two"></span>
        <span className="person child-one"></span>
        <span className="person child-two"></span>
        <span className="ground"></span>
      </div>

      <div className="auth-container">
        <div className="auth-header">
          <Image src="/images/tadoologo2.png" alt="Tadoo logo" width={128} height={128} priority />
          <p className="eyebrow">Velkommen til Tadoo</p>
          <h1>{isLogin ? 'Logg inn' : 'Opprett konto'}</h1>
          <p>Familieapp for oppgaver, kalender og beskjeder</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">E-post</label>
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
            <label htmlFor="password">Passord</label>
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
              <label htmlFor="confirmPassword">Gjenta passord</label>
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
            {loading ? 'Laster...' : isLogin ? 'Logg inn' : 'Opprett konto'}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isLogin ? 'Har du ikke konto?' : 'Har du konto fra før?'}
            <button
              type="button"
              onClick={() => switchMode(!isLogin)}
              className="toggle-button"
            >
              {isLogin ? 'Opprett konto' : 'Logg inn'}
            </button>
          </p>
        </div>

        {!firebaseEnabled && (
          <div className="demo-notice">
            <p>Demo-modus aktiv: bruker kun lokal lagring.</p>
          </div>
        )}

        <p className="creator-credit">Bygget av Robert Filep</p>
      </div>
    </div>
  );
}
