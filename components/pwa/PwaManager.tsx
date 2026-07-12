'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import './PwaManager.scss';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const VISIT_COUNT_KEY = 'tadoo-pwa-visits';
const VISITED_SESSION_KEY = 'tadoo-pwa-session-counted';
const DISMISSED_SESSION_KEY = 'tadoo-pwa-prompt-dismissed';

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

export default function PwaManager() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [eligible, setEligible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }

    if (isStandalone() || sessionStorage.getItem(DISMISSED_SESSION_KEY)) return;

    const iosDevice = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIos(iosDevice);

    let visits = Number.parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10);
    if (!sessionStorage.getItem(VISITED_SESSION_KEY)) {
      visits += 1;
      localStorage.setItem(VISIT_COUNT_KEY, String(visits));
      sessionStorage.setItem(VISITED_SESSION_KEY, 'true');
    }
    setEligible(visits >= 2);

    const captureInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', captureInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', captureInstallPrompt);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_SESSION_KEY, 'true');
    setEligible(false);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallEvent(null);
      setEligible(false);
    }
  };

  if (!eligible || (!installEvent && !isIos)) return null;

  return (
    <aside className="pwa-install-banner" aria-label="Install Tadoo">
      <Image src="/icons/icon-192.png" alt="" width={48} height={48} />
      <div className="pwa-install-copy">
        <strong>Install Tadoo</strong>
        <span>{isIos && !installEvent ? 'Tap Share, then Add to Home Screen.' : 'Keep your family tasks one tap away.'}</span>
      </div>
      {installEvent && (
        <button type="button" className="pwa-install-action" onClick={install}>
          Install
        </button>
      )}
      <button type="button" className="pwa-install-close" onClick={dismiss} aria-label="Dismiss install prompt">
        &times;
      </button>
    </aside>
  );
}
