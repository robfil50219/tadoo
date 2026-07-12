'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { AuthModal, useAuth } from '@/features/auth';
import { Family, FamilySetup, Location, useFamilySync } from '@/features/family';
import { Calendar, Dashboard, TasksList } from '@/features/tasks';
import { Chat } from '@/features/chat';
import { Settings } from '@/features/settings';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { useThemeMode } from '@/lib/hooks/useThemeMode';
import { fadeInUpVariants, modalBackdropVariants } from '@/lib/animations';
import { Navigation } from '@/components/layout';
import './page.scss';

type AppView = 'dashboard' | 'tasks' | 'calendar' | 'family' | 'chat' | 'location' | 'settings';

const appViews: AppView[] = ['dashboard', 'tasks', 'calendar', 'family', 'chat', 'location', 'settings'];

const getViewFromHash = (): AppView | null => {
  const hash = window.location.hash.replace('#', '');
  return appViews.includes(hash as AppView) ? (hash as AppView) : null;
};

export default function Home() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, loading } = useAuth();
  const { familyLoading, familyError, needsFamilySetup } = useFamilySync(user);
  const { t } = useLanguage();
  const { isNight } = useThemeMode();
  const themeModeClass = isNight ? 'night-mode' : 'day-mode';

  const navItems: { id: AppView; label: string }[] = [
    { id: 'dashboard', label: t('nav.dashboard') },
    { id: 'tasks', label: t('nav.tasks') },
    { id: 'calendar', label: t('nav.calendar') },
    { id: 'family', label: t('nav.family') },
    { id: 'chat', label: t('nav.chat') },
    { id: 'location', label: t('nav.location') },
    { id: 'settings', label: t('nav.settings') },
  ];

  useEffect(() => {
    const syncHashView = () => {
      const hashView = getViewFromHash();
      if (hashView) {
        setActiveView(hashView);
      }
    };

    syncHashView();
    window.addEventListener('hashchange', syncHashView);
    return () => window.removeEventListener('hashchange', syncHashView);
  }, []);

  const selectView = (view: AppView) => {
    setActiveView(view);
    setShowMobileMenu(false);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <TasksList />;
      case 'calendar':
        return <Calendar />;
      case 'family':
        return <Family />;
      case 'chat':
        return <Chat />;
      case 'location':
        return <Location />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  let pageContent;

  if (loading || (user && familyLoading)) {
    pageContent = (
      <motion.div
        key="loading"
        className={`app-loading ${themeModeClass}`}
        variants={fadeInUpVariants(shouldReduceMotion)}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {t('common.loading')}
      </motion.div>
    );
  } else if (!user) {
    pageContent = <AuthModal key="auth" />;
  } else if (needsFamilySetup) {
    pageContent = (
      <motion.div
        key="family-setup"
        variants={modalBackdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <FamilySetup user={user} />
      </motion.div>
    );
  } else {
    pageContent = (
      <motion.div
        key="app"
        className={`app-container ${themeModeClass}`}
        variants={modalBackdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {familyError && <div className="app-banner">{familyError}</div>}
        <Navigation
          navItems={navItems}
          activeView={activeView}
          onSelectView={selectView}
          showMobileMenu={showMobileMenu}
          onToggleMobileMenu={() => setShowMobileMenu(!showMobileMenu)}
        />
        <main className="app-main">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeView}
              className="app-view-shell"
              variants={fadeInUpVariants(shouldReduceMotion)}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    );
  }

  return <AnimatePresence mode="wait">{pageContent}</AnimatePresence>;
}
