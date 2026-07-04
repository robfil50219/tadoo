'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useLanguage } from '@/lib/hooks/useLanguage';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import './Settings.scss';

export default function Settings() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="settings-view">
      <div className="settings-header">
        <h2>{t('settings.title')}</h2>
        <p className="subtitle">{t('settings.subtitle')}</p>
      </div>

      <div className="settings-group">
        <h3>{t('settings.account')}</h3>
        <div className="setting-item">
          <label>{t('settings.email')}</label>
          <p>{user?.email || t('common.notProvided')}</p>
        </div>
        <div className="setting-item">
          <button onClick={logout} className="logout-button">
            {t('settings.signOut')}
          </button>
        </div>
      </div>

      <div className="settings-group">
        <h3>{t('settings.language')}</h3>
        <div className="setting-item">
          <label>{t('language.preferred')}</label>
          <LanguageSwitcher className="settings-language-switcher" menuPlacement="bottom" />
        </div>
      </div>
    </div>
  );
}
