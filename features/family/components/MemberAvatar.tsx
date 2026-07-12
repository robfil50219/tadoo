'use client';

import { useEffect, useState } from 'react';
import type { FamilyMember } from '../family.types';
import { resolveMemberProfileImageUrl } from '../services/familyFirestore';

interface MemberAvatarProps {
  member: FamilyMember;
  className?: string;
  alt?: string;
}

export default function MemberAvatar({ member, className = '', alt = '' }: MemberAvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setImageUrl(null);
    if (!member.profileImagePath) return () => { active = false; };
    void resolveMemberProfileImageUrl(member.profileImagePath)
      .then((url) => {
        if (active) setImageUrl(`${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(member.profileImageUpdatedAt || '')}`);
      })
      .catch(() => {
        if (active) setImageUrl(null);
      });
    return () => { active = false; };
  }, [member.profileImagePath, member.profileImageUpdatedAt]);

  return (
    <div className={`member-avatar ${className}`.trim()} style={{ backgroundColor: member.color }}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={alt} onError={() => setImageUrl(null)} />
      ) : (
        <span className="member-avatar-initials" aria-label={alt || undefined}>{member.avatar}</span>
      )}
    </div>
  );
}
