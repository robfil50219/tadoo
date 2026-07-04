'use client';

import { useEffect, useState } from 'react';
import { FamilyRole, useTodoStore } from '@/lib/store/todoStore';
import { useLanguage } from '@/lib/hooks/useLanguage';
import './Family.scss';

export default function Family() {
  const { state, addMember, updateFamilyName, createInvite } = useTodoStore();
  const { t } = useLanguage();
  const [familyName, setFamilyName] = useState(state.familyName);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState<FamilyRole>('child');
  const [memberColor, setMemberColor] = useState('#007c89');
  const [inviteRole, setInviteRole] = useState<FamilyRole>('adult');
  const [inviteRecipient, setInviteRecipient] = useState('');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setFamilyName(state.familyName);
  }, [state.familyName]);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const saveFamilyName = (event: React.FormEvent) => {
    event.preventDefault();
    updateFamilyName(familyName);
  };

  const submitMember = (event: React.FormEvent) => {
    event.preventDefault();
    addMember(memberName, memberRole, memberColor);
    setMemberName('');
    setMemberRole('child');
  };

  const submitInvite = (event: React.FormEvent) => {
    event.preventDefault();
    createInvite(inviteRole, inviteRecipient);
    setInviteRecipient('');
  };

  return (
    <div className="family-view">
      <div className="family-header">
        <h2>{t('family.title')}</h2>
        <p className="subtitle">{t('family.subtitle')}</p>
      </div>

      <form className="family-name-form" onSubmit={saveFamilyName}>
        <label htmlFor="familyName">{t('family.familyName')}</label>
        <div className="inline-form">
          <input
            id="familyName"
            value={familyName}
            onChange={(event) => setFamilyName(event.target.value)}
          />
          <button type="submit">{t('common.save')}</button>
        </div>
      </form>

      <section className="family-section">
        <h3>{t('family.members')}</h3>
        <div className="member-grid">
          {state.members.map((member) => (
            <article className="member-card" key={member.id}>
              <div className="member-avatar" aria-hidden="true">
                <svg className="member-avatar-background" viewBox="0 0 42 42" focusable="false">
                  <circle cx="21" cy="21" r="21" fill={member.color} />
                </svg>
                <span className="member-avatar-initials">{member.avatar}</span>
              </div>
              <div>
                <h4>{member.name}</h4>
                <p>{t(`common.${member.role}`)}</p>
                <span>{member.locationLabel}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="family-section">
        <h3>{t('family.addMember')}</h3>
        <form className="member-form" onSubmit={submitMember}>
          <input
            value={memberName}
            onChange={(event) => setMemberName(event.target.value)}
            placeholder={t('family.namePlaceholder')}
            required
          />
          <select
            value={memberRole}
            onChange={(event) => setMemberRole(event.target.value as FamilyRole)}
            aria-label={t('family.memberRole')}
          >
            <option value="adult">{t('common.adult')}</option>
            <option value="child">{t('common.child')}</option>
          </select>
          <input
            type="color"
            value={memberColor}
            onChange={(event) => setMemberColor(event.target.value)}
            aria-label={t('family.memberColor')}
          />
          <button type="submit">{t('common.add')}</button>
        </form>
      </section>

      <section className="family-section">
        <h3>{t('family.invites')}</h3>
        <form className="member-form" onSubmit={submitInvite}>
          <input
            value={inviteRecipient}
            onChange={(event) => setInviteRecipient(event.target.value)}
            placeholder={t('family.inviteRecipientPlaceholder')}
          />
          <select
            value={inviteRole}
            onChange={(event) => setInviteRole(event.target.value as FamilyRole)}
            aria-label={t('family.inviteRole')}
          >
            <option value="adult">{t('common.adult')}</option>
            <option value="child">{t('common.child')}</option>
          </select>
          <button type="submit">{t('family.createInvite')}</button>
        </form>

        {state.invites.length > 0 && (
          <div className="invite-list">
            {state.invites.map((invite) => (
              <div className="invite-item" key={invite.id}>
                <strong>{invite.code}</strong>
                <span>{t(`common.${invite.role}`)}</span>
                <span>{invite.recipient || t('common.noRecipient')}</span>
                {origin && (
                  <span className="invite-link">
                    {`${origin}/?invite=${invite.code}`}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
