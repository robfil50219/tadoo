'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { subtleButtonHover, subtleButtonTap } from '@/lib/animations';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { useThemeMode } from '@/lib/hooks/useThemeMode';

import './Navigation.scss';

interface NavItem<TView extends string = string> {
  id: TView;
  label: string;
}

interface NavigationProps<TView extends string = string> {
  navItems: NavItem<TView>[];
  activeView: TView;
  onSelectView: (view: TView) => void;
  showMobileMenu: boolean;
  onToggleMobileMenu: () => void;
}

export default function Navigation<TView extends string>({
  navItems,
  activeView,
  onSelectView,
  showMobileMenu,
  onToggleMobileMenu,
}: NavigationProps<TView>) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const { t } = useLanguage();
  const { isNight, toggleThemeMode } = useThemeMode();

  return (
    <nav className="navigation">
      <div className="nav-header">
        <Image className="nav-logo" src="/images/tadoologo2.png" alt="Tadoo logo" width={128} height={128} priority />
        <div className="nav-actions">
          <motion.button
            type="button"
            className={`nav-mode-toggle ${isNight ? 'night-selected' : 'day-selected'}`}
            aria-label={isNight ? t('auth.dayMode') : t('auth.nightMode')}
            aria-pressed={isNight}
            onClick={toggleThemeMode}
            whileTap={subtleButtonTap(shouldReduceMotion)}
            whileHover={subtleButtonHover(shouldReduceMotion)}
          >
            <span className="nav-mode-icon" aria-hidden="true" />
          </motion.button>
          <motion.button
            className="nav-toggle"
            onClick={onToggleMobileMenu}
            aria-label={t('nav.toggleMenu')}
            aria-expanded={showMobileMenu}
            whileTap={subtleButtonTap(shouldReduceMotion)}
          >
            ☰
          </motion.button>
        </div>
      </div>
      <ul className={`nav-items ${showMobileMenu ? 'mobile-open' : ''}`}>
        {navItems.map((item) => (
          <li key={item.id}>
            <motion.a
              href={`#${item.id}`}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              aria-current={activeView === item.id ? 'page' : undefined}
              onClick={() => onSelectView(item.id)}
              whileTap={subtleButtonTap(shouldReduceMotion)}
              whileHover={subtleButtonHover(shouldReduceMotion)}
            >
              {item.label}
            </motion.a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
