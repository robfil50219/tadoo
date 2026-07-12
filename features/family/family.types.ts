import type { FamilyMessage } from '@/features/chat/chat.types';
import type { TodoItem } from '@/features/tasks/tasks.types';

export type FamilyRole = 'adult' | 'child';

export interface FamilyMember {
  id: string;
  uid?: string;
  email?: string;
  accountStatus: 'local' | 'invited' | 'joined';
  name: string;
  role: FamilyRole;
  color: string;
  avatar: string;
  profileImagePath?: string;
  profileImageUpdatedAt?: string;
  status: string;
  locationLabel: string;
  locationUpdatedAt: string;
  latitude: number;
  longitude: number;
  locationAccuracyMeters?: number;
}

export interface FamilyInvite {
  id: string;
  code: string;
  familyId: string;
  role: FamilyRole;
  createdAt: string;
  expiresAt: string;
  createdById?: string;
  recipient?: string;
  usedByUid?: string;
}

export interface FamilyState {
  familyId?: string;
  familyName: string;
  isSetupComplete: boolean;
  ownerUid?: string;
  memberUids?: Record<string, boolean>;
  adultUids?: Record<string, boolean>;
  members: FamilyMember[];
  todos: TodoItem[];
  messages: FamilyMessage[];
  invites: FamilyInvite[];
}
