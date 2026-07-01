'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLanguage } from '@/lib/hooks/useLanguage';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/views/Dashboard';
import TasksList from '@/components/views/TasksList';
import Calendar from '@/components/views/Calendar';
import Family from '@/components/views/Family';
import Chat from '@/components/views/Chat';
import Location from '@/components/views/Location';
import Settings from '@/components/views/Settings';
import AuthModal from '@/components/AuthModal';
import './page.scss';

type AppView = 'dashboard' | 'tasks' | 'calendar' | 'family' | 'chat' | 'location' | 'settings';

const appViews: AppView[] = ['dashboard', 'tasks', 'calendar', 'family', 'chat', 'location', 'settings'];

const getViewFromHash = (): AppView | null => {
  const hash = window.location.hash.replace('#', '');
  return appViews.includes(hash as AppView) ? (hash as AppView) : null;
};

export default function Home() {
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  const navItems: { id: AppView; label: string }[] = [
    { id: 'dashboard', label: t('dashboard') },
    { id: 'tasks', label: t('tasks') },
    { id: 'calendar', label: t('calendar') },
    { id: 'family', label: t('family') },
    { id: 'chat', label: t('chat') },
    { id: 'location', label: t('location') },
    { id: 'settings', label: t('settings') },
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

  if (loading) {
    return <div className="app-loading">Loading...</div>;
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <div className="app-container">
      <Navigation
        navItems={navItems}
        activeView={activeView}
        onSelectView={selectView}
        showMobileMenu={showMobileMenu}
        onToggleMobileMenu={() => setShowMobileMenu(!showMobileMenu)}
      />
      <main className="app-main">
        {renderView()}
      </main>
    </div>
  );
}
