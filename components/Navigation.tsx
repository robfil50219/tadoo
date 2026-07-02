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
        <Image className="nav-logo" src="/images/tadoologo2.png" alt="Tadoo logo" width={128} height={128} priority />
        <button className="nav-toggle" onClick={onToggleMobileMenu}>
          ☰
        </button>
      </div>
      <ul className={`nav-items ${showMobileMenu ? 'mobile-open' : ''}`}>
        {navItems.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              aria-current={activeView === item.id ? 'page' : undefined}
              onClick={() => onSelectView(item.id)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
