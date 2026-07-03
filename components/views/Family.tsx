'use client';

import { useEffect, useState } from 'react';
import { FamilyRole, useTodoStore } from '@/lib/store/todoStore';
import './Family.scss';

export default function Family() {
  const { state, addMember, updateFamilyName, createInvite } = useTodoStore();
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
        <h2>Family</h2>
        <p className="subtitle">Manage members and invitations</p>
      </div>

      <form className="family-name-form" onSubmit={saveFamilyName}>
        <label htmlFor="familyName">Family name</label>
        <div className="inline-form">
          <input
            id="familyName"
            value={familyName}
            onChange={(event) => setFamilyName(event.target.value)}
          />
          <button type="submit">Save</button>
        </div>
      </form>

      <section className="family-section">
        <h3>Members</h3>
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
                <p>{member.role}</p>
                <span>{member.locationLabel}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="family-section">
        <h3>Add member</h3>
        <form className="member-form" onSubmit={submitMember}>
          <input
            value={memberName}
            onChange={(event) => setMemberName(event.target.value)}
            placeholder="Name"
            required
          />
          <select
            value={memberRole}
            onChange={(event) => setMemberRole(event.target.value as FamilyRole)}
            aria-label="Member role"
          >
            <option value="adult">Adult</option>
            <option value="child">Child</option>
          </select>
          <input
            type="color"
            value={memberColor}
            onChange={(event) => setMemberColor(event.target.value)}
            aria-label="Member color"
          />
          <button type="submit">Add</button>
        </form>
      </section>

      <section className="family-section">
        <h3>Invites</h3>
        <form className="member-form" onSubmit={submitInvite}>
          <input
            value={inviteRecipient}
            onChange={(event) => setInviteRecipient(event.target.value)}
            placeholder="Email or phone"
          />
          <select
            value={inviteRole}
            onChange={(event) => setInviteRole(event.target.value as FamilyRole)}
            aria-label="Invite role"
          >
            <option value="adult">Adult</option>
            <option value="child">Child</option>
          </select>
          <button type="submit">Create invite</button>
        </form>

        {state.invites.length > 0 && (
          <div className="invite-list">
            {state.invites.map((invite) => (
              <div className="invite-item" key={invite.id}>
                <strong>{invite.code}</strong>
                <span>{invite.role}</span>
                <span>{invite.recipient || 'No recipient'}</span>
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
