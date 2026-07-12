'use client';

import { useEffect, useState } from 'react';
import { useTodoStore } from '@/lib/store/todoStore';
import type { FamilyMember, FamilyRole } from '../family.types';
import { useLanguage } from '@/lib/hooks/useLanguage';
import MemberAvatar from './MemberAvatar';
import MemberProfileModal from './MemberProfileModal';
import './Family.scss';

export default function Family() {
  const { state, remote, addMember, updateMember, deleteMember, updateFamilyName, createInvite } = useTodoStore();
  const { t } = useLanguage();
  const [familyName, setFamilyName] = useState(state.familyName);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState<FamilyRole>('child');
  const [memberColor, setMemberColor] = useState('#007c89');
  const [inviteRole, setInviteRole] = useState<FamilyRole>('adult');
  const [inviteRecipient, setInviteRecipient] = useState('');
  const [origin, setOrigin] = useState('');
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const currentUserIsAdult = Boolean(remote.userId && state.adultUids?.[remote.userId]);
  const canEditMember = (member: FamilyMember) =>
    currentUserIsAdult
    || Boolean(remote.userId && member.accountStatus === 'joined' && member.uid === remote.userId);
  const canDeleteMember = (member: FamilyMember) =>
    currentUserIsAdult && member.accountStatus === 'local' && !member.uid;
  const canManageMemberImage = (member: FamilyMember) =>
    Boolean(remote.userId && member.uid === remote.userId)
    || canDeleteMember(member);

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

  const beginEdit = (member: FamilyMember) => {
    if (!canEditMember(member)) return;
    setEditingMember(member);
    setProfileStatus(null);
  };

  const saveProfile = async (member: FamilyMember) => {
    await updateMember(member);
    setEditingMember(null);
    setProfileStatus({ type: 'success', message: t('family.profileSaved') });
  };

  const deleteProfile = async (member: FamilyMember) => {
    if (!canDeleteMember(member)) throw new Error('Not authorized to delete this profile');
    await deleteMember(member.id);
    setEditingMember(null);
    setProfileStatus({ type: 'success', message: t('family.profileDeleted') });
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
        {profileStatus && (
          <p className={`profile-feedback ${profileStatus.type}`} role={profileStatus.type === 'error' ? 'alert' : 'status'}>
            {profileStatus.message}
          </p>
        )}
        <div className="member-grid">
          {state.members.map((member) => (
            <article className="member-card" key={member.id}>
              <MemberAvatar member={member} alt={`${member.name} ${t('family.profileImageAlt')}`} />
              <div className="member-details">
                <h4>{member.name}</h4>
                <p>{t(`common.${member.role}`)}</p>
                <span>{member.locationLabel}</span>
              </div>
              {canEditMember(member) && (
                <div className="member-actions">
                  <button type="button" className="member-action" onClick={() => beginEdit(member)}>
                    {t('common.edit')}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>

      </section>

      {editingMember && state.familyId && canEditMember(editingMember) && (
        <MemberProfileModal
          familyId={state.familyId}
          member={editingMember}
          canManageImage={canManageMemberImage(editingMember)}
          canDelete={canDeleteMember(editingMember)}
          onClose={() => setEditingMember(null)}
          onSave={saveProfile}
          onDelete={deleteProfile}
        />
      )}

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
