'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { useThemeMode } from '@/lib/hooks/useThemeMode';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import './Settings.scss';

export default function Settings() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { isNight, toggleThemeMode } = useThemeMode();

  return (
    <div className="settings-view">
      <div className="settings-header">
        <span className="settings-kicker">{t('settings.kicker')}</span>
        <h2>{t('settings.title')}</h2>
        <p className="subtitle">{t('settings.subtitle')}</p>
      </div>

      <div className="settings-card">
        <div className="settings-avatar" aria-hidden="true">
          {user?.email?.charAt(0).toUpperCase() || 'T'}
        </div>
        <div>
          <p className="settings-card-label">{t('settings.signedInAs')}</p>
          <h3>{user?.email || t('common.notProvided')}</h3>
        </div>
      </div>

      <div className="settings-list" aria-label={t('settings.title')}>
        <section className="settings-group">
          <h3>{t('settings.account')}</h3>
          <div className="setting-item">
            <div>
              <label>{t('settings.email')}</label>
              <p>{user?.email || t('common.notProvided')}</p>
            </div>
          </div>
          <div className="setting-item setting-item-action">
            <div>
              <label>{t('settings.signOut')}</label>
              <p>{t('settings.signOutHelp')}</p>
            </div>
            <button type="button" onClick={logout} className="secondary-button">
              {t('settings.signOut')}
            </button>
          </div>
          <div className="setting-item setting-item-action danger-row">
            <div>
              <label>{t('settings.deleteAccount')}</label>
              <p>{t('settings.deleteAccountHelp')}</p>
            </div>
            <button type="button" className="danger-button">
              {t('settings.deleteAccount')}
            </button>
          </div>
        </section>

        <section className="settings-group">
          <h3>{t('settings.language')}</h3>
          <div className="setting-item setting-item-action">
            <div>
              <label>{t('language.preferred')}</label>
              <p>{t('settings.languageHelp')}</p>
            </div>
            <LanguageSwitcher className="settings-language-switcher" menuPlacement="bottom" />
          </div>
        </section>

        <section className="settings-group">
          <h3>{t('settings.appearance')}</h3>
          <div className="setting-item setting-item-action">
            <div>
              <label>{t('settings.theme')}</label>
              <p>{t('settings.themeHelp')}</p>
            </div>
            <button
              type="button"
              className={`theme-mode-button ${isNight ? 'night-selected' : 'day-selected'}`}
              aria-pressed={isNight}
              onClick={toggleThemeMode}
            >
              <span className="theme-mode-dot" aria-hidden="true" />
              {isNight ? t('auth.dayMode') : t('auth.nightMode')}
            </button>
          </div>
        </section>

        <section className="settings-group">
          <h3>{t('settings.notifications')}</h3>
          <div className="setting-item setting-item-action">
            <div>
              <label>{t('settings.familyReminders')}</label>
              <p>{t('settings.familyRemindersHelp')}</p>
            </div>
            <span className="status-pill">{t('settings.comingSoon')}</span>
          </div>
        </section>

        <section className="settings-group">
          <h3>{t('settings.privacy')}</h3>
          <a className="setting-link" href="/privacy" target="_blank" rel="noreferrer">
            <span>{t('settings.privacyPolicy')}</span>
            <span aria-hidden="true">&rsaquo;</span>
          </a>
          <a className="setting-link" href="/terms" target="_blank" rel="noreferrer">
            <span>{t('settings.termsOfService')}</span>
            <span aria-hidden="true">&rsaquo;</span>
          </a>
        </section>

        <section className="settings-group">
          <h3>{t('settings.about')}</h3>
          <div className="setting-item">
            <div>
              <label>{t('settings.appName')}</label>
              <p>{t('settings.appDescription')}</p>
            </div>
          </div>
          <div className="setting-item">
            <div>
              <label>{t('settings.version')}</label>
              <p>v0.4.0-alpha</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
