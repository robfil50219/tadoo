'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { subtleButtonHover, subtleButtonTap } from '@/lib/animations';

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

  return (
    <nav className="navigation">
      <div className="nav-header">
        <Image className="nav-logo" src="/images/tadoologo2.png" alt="Tadoo logo" width={128} height={128} priority />
        <motion.button
          className="nav-toggle"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={showMobileMenu}
          whileTap={subtleButtonTap(shouldReduceMotion)}
        >
          ☰
        </motion.button>
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
