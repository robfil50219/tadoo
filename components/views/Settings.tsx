'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useLanguage } from '@/lib/hooks/useLanguage';
import './Settings.scss';

export default function Settings() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="settings-view">
      <div className="settings-header">
        <h2>Settings</h2>
        <p className="subtitle">Manage your account and preferences</p>
      </div>

      <div className="settings-group">
        <h3>Account</h3>
        <div className="setting-item">
          <label>Email</label>
          <p>{user?.email || 'Not provided'}</p>
        </div>
        <div className="setting-item">
          <button onClick={logout} className="logout-button">
            Sign Out
          </button>
        </div>
      </div>

      <div className="settings-group">
        <h3>Language</h3>
        <div className="setting-item">
          <label htmlFor="language">Preferred Language</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="language-select"
          >
            <option value="en">English</option>
            <option value="no">Norsk</option>
            <option value="sv">Svenska</option>
            <option value="da">Dansk</option>
          </select>
        </div>
      </div>
    </div>
  );
}
