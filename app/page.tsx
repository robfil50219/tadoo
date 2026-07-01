'use client';

import Image from 'next/image';
import { useState } from 'react';
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
        <div className="app-content">
          {renderView()}
        </div>
        <footer className="app-footer">
          <Image
            src="/images/tadoologo2.png"
            alt="Tadoo"
            width={180}
            height={60}
            className="app-footer-logo"
          />
        </footer>
      </main>
    </div>
  );
}
