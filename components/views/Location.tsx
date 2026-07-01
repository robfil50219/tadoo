'use client';

import { useEffect, useState } from 'react';
import { useTodoStore } from '@/lib/store/todoStore';
import './Location.scss';

export default function Location() {
  const { state, updateMemberLocation } = useTodoStore();
  const [memberId, setMemberId] = useState(state.members[0]?.id || '');
  const [locationLabel, setLocationLabel] = useState('');

  useEffect(() => {
    if (!memberId && state.members[0]) {
      setMemberId(state.members[0].id);
    }
  }, [memberId, state.members]);

  const updateLocation = (event: React.FormEvent) => {
    event.preventDefault();
    updateMemberLocation(memberId, locationLabel);
    setLocationLabel('');
  };

  const formatTime = (value: string) => new Intl.DateTimeFormat('nb-NO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

  return (
    <div className="location-view">
      <div className="location-header">
        <h2>Location</h2>
        <p className="subtitle">Share manual location status</p>
      </div>

      <div className="location-grid">
        {state.members.map((member) => (
          <article className="location-card" key={member.id}>
            <div className="member-avatar" style={{ backgroundColor: member.color }}>
              {member.avatar}
            </div>
            <div>
              <h3>{member.name}</h3>
              <p>{member.locationLabel}</p>
              <span>{formatTime(member.locationUpdatedAt)}</span>
            </div>
          </article>
        ))}
      </div>

      <form className="location-form" onSubmit={updateLocation}>
        <select value={memberId} onChange={(event) => setMemberId(event.target.value)}>
          {state.members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
        <input
          value={locationLabel}
          onChange={(event) => setLocationLabel(event.target.value)}
          placeholder="Home, school, work..."
          required
        />
        <button type="submit">Update</button>
      </form>
    </div>
  );
}
