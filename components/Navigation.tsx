'use client';

import Image from 'next/image';
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
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h1 className="nav-logo">
          <Image
            src="/images/tadoologo2.png"
            alt="Tadoo"
            width={150}
            height={50}
            className="nav-logo-image"
            priority
          />
        </h1>
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
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
