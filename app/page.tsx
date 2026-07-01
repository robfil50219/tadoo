'use client';

import { useEffect, useState } from 'react';
import { useTodoStore } from '@/lib/store/todoStore';
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
  const { user } = useAuth();
  const { state } = useTodoStore();
  const { t, locale } = useLanguage();

  const navItems: { id: AppView; labelKey: string }[] = [
    { id: 'dashboard', labelKey: 'dashboard' },
    { id: 'tasks', labelKey: 'tasks' },
    { id: 'calendar', labelKey: 'calendar' },
    { id: 'family', labelKey: 'family' },
    { id: 'chat', labelKey: 'chat' },
    { id: 'location', labelKey: 'location' },
    { id: 'settings', labelKey: 'settings' },
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
        activeLabel={t(navItems.find(item => item.id === activeView)?.labelKey || 'dashboard')}
      />
      <main className="app-main">
        {renderView()}
      </main>
    </div>
  );
}
