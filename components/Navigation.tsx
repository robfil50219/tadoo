'use client';

import { useState } from 'react';
import './Navigation.scss';

interface NavItem {
  id: string;
  labelKey: string;
}

interface NavigationProps {
  navItems: NavItem[];
  activeView: string;
  onSelectView: (view: string) => void;
  showMobileMenu: boolean;
  onToggleMobileMenu: () => void;
  activeLabel: string;
}

export default function Navigation({
  navItems,
  activeView,
  onSelectView,
  showMobileMenu,
  onToggleMobileMenu,
  activeLabel,
}: NavigationProps) {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h1 className="nav-logo">Tadoo</h1>
        <button className="nav-toggle" onClick={onToggleMobileMenu}>
          ☰
        </button>
      </div>
      <ul className={`nav-items ${showMobileMenu ? 'mobile-open' : ''}`}>
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => onSelectView(item.id)}
            >
              {item.labelKey}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
