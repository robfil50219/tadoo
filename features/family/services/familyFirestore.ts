import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  arrayUnion,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import { firebaseConfig, firebaseEnabled } from '@/lib/config/firebase';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
  type UploadTask,
} from 'firebase/storage';
import type { FamilyInvite, FamilyMember, FamilyRole, FamilyState } from '../family.types';

export interface RemoteFamilyUser {
  id: string;
  email?: string;
  name?: string;
  isDemo?: boolean;
}

interface UserProfile {
  familyId?: string;
  memberId?: string;
}

const getDb = (): Firestore => {
  if (!firebaseEnabled) {
    throw new Error('Firebase is not configured');
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getFirestore(app);
};

const getFirebaseApp = () => getApps().length ? getApp() : initializeApp(firebaseConfig);

const getProfileStorage = () => {
  if (!firebaseEnabled) throw new Error('Firebase is not configured');
  return getStorage(getFirebaseApp());
};

export const memberProfileImagePath = (familyId: string, member: FamilyMember) =>
  member.uid
    ? `families/${familyId}/profiles/${member.uid}/avatar`
    : `families/${familyId}/local-profiles/${member.id}/avatar`;

export const resolveMemberProfileImageUrl = async (path: string) =>
  getDownloadURL(ref(getProfileStorage(), path));

export const uploadMemberProfileImage = (
  path: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<void> => new Promise((resolve, reject) => {
  const task: UploadTask = uploadBytesResumable(ref(getProfileStorage(), path), file, {
    contentType: file.type,
    cacheControl: 'private,max-age=3600',
  });
  task.on(
    'state_changed',
    (snapshot) => onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
    reject,
    () => resolve()
  );
});

export const deleteMemberProfileImage = async (path: string) => {
  await deleteObject(ref(getProfileStorage(), path));
};

const cleanForFirestore = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const initialsFor = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();

export const createEmptyFamilyState = (ownerUid?: string): FamilyState => ({
  familyName: '',
  isSetupComplete: false,
  ownerUid,
  memberUids: ownerUid ? { [ownerUid]: true } : {},
  adultUids: ownerUid ? { [ownerUid]: true } : {},
  members: [],
  todos: [],
  messages: [],
  invites: [],
});

const normalizeFamilyState = (data: Partial<FamilyState>, fallbackFamilyId: string): FamilyState => ({
  familyId: data.familyId || fallbackFamilyId,
  familyName: data.familyName || '',
  isSetupComplete: Boolean(data.isSetupComplete),
  ownerUid: data.ownerUid,
  memberUids: data.memberUids || {},
  adultUids: data.adultUids || {},
  members: data.members || [],
  todos: data.todos || [],
  messages: data.messages || [],
  invites: data.invites || [],
});

export const saveFamilyState = async (state: FamilyState) => {
  if (!state.familyId) return;
  await setDoc(doc(getDb(), 'families', state.familyId), cleanForFirestore(state));
};

type MemberProfileMutation =
  | { action: 'create'; after: FamilyMember }
  | { action: 'update'; before: FamilyMember; after: FamilyMember }
  | { action: 'delete'; before: FamilyMember };

export const saveMemberProfileMutation = async (
  familyId: string,
  members: FamilyMember[],
  mutation: MemberProfileMutation
) => {
  await updateDoc(doc(getDb(), 'families', familyId), {
    members: cleanForFirestore(members),
    lastProfileMutation: cleanForFirestore(mutation),
  });
};

export const subscribeToUserFamily = (
  userId: string,
  onState: (state: FamilyState) => void,
  onError: (message: string) => void
): Unsubscribe => {
  const db = getDb();
  let familyUnsubscribe: Unsubscribe | null = null;

  const stopProfile = onSnapshot(
    doc(db, 'userProfiles', userId),
    (profileSnapshot) => {
      const profile = profileSnapshot.exists() ? (profileSnapshot.data() as UserProfile) : {};
      const familyId = profile.familyId;

      if (!familyId) {
        familyUnsubscribe?.();
        familyUnsubscribe = null;
        onState(createEmptyFamilyState(userId));
        return;
      }

      familyUnsubscribe?.();
      familyUnsubscribe = onSnapshot(
        doc(db, 'families', familyId),
        (familySnapshot) => {
          if (!familySnapshot.exists()) {
            onState(createEmptyFamilyState(userId));
            onError('Fant ikke familien som er koblet til brukeren.');
            return;
          }

          onState(normalizeFamilyState(familySnapshot.data() as Partial<FamilyState>, familyId));
        },
        (error) => onError(error.message)
      );
    },
    (error) => onError(error.message)
  );

  return () => {
    familyUnsubscribe?.();
    stopProfile();
  };
};

export const createFamilyDocument = async (
  user: RemoteFamilyUser,
  familyName: string,
  adultName: string
): Promise<FamilyState> => {
  const db = getDb();
  const familyRef = doc(db, 'families', crypto.randomUUID());
  const now = new Date().toISOString();
  const ownerMember: FamilyMember = {
    id: user.id,
    uid: user.id,
    email: user.email,
    accountStatus: 'joined',
    name: adultName.trim(),
    role: 'adult',
    color: '#007c89',
    avatar: initialsFor(adultName),
    status: 'Tilgjengelig',
    locationLabel: 'Ikke delt',
    locationUpdatedAt: now,
    latitude: 59.9139,
    longitude: 10.7522,
  };

  const state: FamilyState = {
    familyId: familyRef.id,
    familyName: familyName.trim(),
    isSetupComplete: true,
    ownerUid: user.id,
    memberUids: { [user.id]: true },
    adultUids: { [user.id]: true },
    members: [ownerMember],
    todos: [],
    messages: [],
    invites: [],
  };

  const batch = writeBatch(db);
  batch.set(familyRef, cleanForFirestore(state));
  batch.set(doc(db, 'userProfiles', user.id), {
    familyId: familyRef.id,
    memberId: user.id,
    email: user.email || null,
    displayName: ownerMember.name,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();

  return state;
};

export const publishInviteCode = async (invite: FamilyInvite, createdByUid?: string) => {
  await setDoc(doc(getDb(), 'inviteCodes', invite.code), {
    code: invite.code,
    familyId: invite.familyId,
    role: invite.role,
    recipient: invite.recipient || null,
    createdByUid: createdByUid || null,
    createdAt: invite.createdAt,
    expiresAt: invite.expiresAt,
    expiresAtMs: new Date(invite.expiresAt).getTime(),
    usedByUid: invite.usedByUid || null,
  });
};

export const joinFamilyByInviteCode = async (
  user: RemoteFamilyUser,
  code: string,
  displayName: string
) => {
  const db = getDb();
  const normalizedCode = code.trim().toUpperCase();
  const inviteRef = doc(db, 'inviteCodes', normalizedCode);
  const inviteSnapshot = await getDoc(inviteRef);

  if (!inviteSnapshot.exists()) {
    throw new Error('Fant ikke invitasjonskoden.');
  }

  const invite = inviteSnapshot.data() as {
    familyId?: string;
    role?: FamilyRole;
    expiresAt?: string;
    usedByUid?: string | null;
  };

  if (!invite.familyId || !invite.role) {
    throw new Error('Invitasjonen mangler familieinformasjon.');
  }

  if (invite.usedByUid && invite.usedByUid !== user.id) {
    throw new Error('Invitasjonen er allerede brukt.');
  }

  if (invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()) {
    throw new Error('Invitasjonen har utløpt.');
  }

  const trimmedName = displayName.trim();
  const member: FamilyMember = {
    id: user.id,
    uid: user.id,
    email: user.email,
    accountStatus: 'joined',
    name: trimmedName,
    role: invite.role,
    color: invite.role === 'adult' ? '#7c3aed' : '#f59e0b',
    avatar: initialsFor(trimmedName),
    status: invite.role === 'adult' ? 'Tilgjengelig' : 'Hjemme',
    locationLabel: 'Ikke delt',
    locationUpdatedAt: new Date().toISOString(),
    latitude: 59.9139,
    longitude: 10.7522,
  };

  const batch = writeBatch(db);
  batch.update(doc(db, 'families', invite.familyId), {
    members: arrayUnion(cleanForFirestore(member)),
    [`memberUids.${user.id}`]: true,
    ...(invite.role === 'adult' ? { [`adultUids.${user.id}`]: true } : {}),
    lastMembershipInviteCode: normalizedCode,
  });
  batch.set(doc(db, 'userProfiles', user.id), {
    familyId: invite.familyId,
    memberId: user.id,
    email: user.email || null,
    displayName: trimmedName,
    updatedAt: serverTimestamp(),
  });
  batch.update(inviteRef, { usedByUid: user.id, usedAt: serverTimestamp() });
  await batch.commit();
};
