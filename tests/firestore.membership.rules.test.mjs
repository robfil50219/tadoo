import { readFile } from 'node:fs/promises';
import test, { after, before, beforeEach } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  arrayRemove,
  arrayUnion,
  deleteField,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';

const PROJECT_ID = process.env.GCLOUD_PROJECT || 'demo-tadoo-app';
const FAMILY_ID = 'family-one';
const OWNER_UID = 'owner-one';
const CHILD_UID = 'child-one';
const ADULT_UID = 'adult-two';
const OUTSIDER_UID = 'outsider';
const NEW_MEMBER_UID = 'new-member';

const owner = { id: OWNER_UID, uid: OWNER_UID, accountStatus: 'joined', name: 'Owner', role: 'adult' };
const child = { id: CHILD_UID, uid: CHILD_UID, accountStatus: 'joined', name: 'Child', role: 'child' };
const adult = { id: ADULT_UID, uid: ADULT_UID, accountStatus: 'joined', name: 'Adult', role: 'adult' };
const newChild = {
  id: NEW_MEMBER_UID,
  uid: NEW_MEMBER_UID,
  accountStatus: 'joined',
  name: 'New child',
  role: 'child',
};
const localChild = {
  id: 'local-child',
  accountStatus: 'local',
  name: 'Local child',
  role: 'child',
  color: '#f59e0b',
};

let testEnv;

before(async () => {
  const rules = await readFile('firestore.rules', 'utf8');
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { host: '127.0.0.1', port: 8080, rules },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'families', FAMILY_ID), {
      familyName: 'Test family',
      isSetupComplete: true,
      ownerUid: OWNER_UID,
      memberUids: { [OWNER_UID]: true, [CHILD_UID]: true, [ADULT_UID]: true },
      adultUids: { [OWNER_UID]: true, [ADULT_UID]: true },
      members: [owner, child, adult],
      todos: [],
      messages: [],
      invites: [],
    });
  });
});

after(async () => {
  await testEnv?.cleanup();
});

const familyRefFor = (uid) => doc(testEnv.authenticatedContext(uid).firestore(), 'families', FAMILY_ID);

test('an outsider cannot add themselves to a family', async () => {
  await assertFails(updateDoc(familyRefFor(OUTSIDER_UID), { [`memberUids.${OUTSIDER_UID}`]: true }));
});

test('an ordinary member cannot add another user', async () => {
  await assertFails(
    updateDoc(familyRefFor(CHILD_UID), {
      [`memberUids.${NEW_MEMBER_UID}`]: true,
      members: arrayUnion(newChild),
    })
  );
});

test('an ordinary member cannot promote themselves', async () => {
  await assertFails(
    updateDoc(familyRefFor(CHILD_UID), {
      [`adultUids.${CHILD_UID}`]: true,
      members: arrayRemove(child),
    })
  );
});

test('an ordinary member cannot remove an adult or owner', async () => {
  await assertFails(
    updateDoc(familyRefFor(CHILD_UID), {
      [`memberUids.${OWNER_UID}`]: deleteField(),
      [`adultUids.${OWNER_UID}`]: deleteField(),
      members: arrayRemove(owner),
    })
  );
});

test('an authorized adult can add and remove a non-owner member', async () => {
  const familyRef = familyRefFor(ADULT_UID);
  await assertSucceeds(
    updateDoc(familyRef, {
      [`memberUids.${NEW_MEMBER_UID}`]: true,
      members: arrayUnion(newChild),
      lastMembershipMutation: {
        action: 'add',
        uid: NEW_MEMBER_UID,
        role: 'child',
        member: newChild,
      },
    })
  );
  await assertSucceeds(
    updateDoc(familyRef, {
      [`memberUids.${NEW_MEMBER_UID}`]: deleteField(),
      members: arrayRemove(newChild),
      lastMembershipMutation: {
        action: 'remove',
        uid: NEW_MEMBER_UID,
        role: 'child',
        member: newChild,
      },
    })
  );
});

test('an authorized adult cannot leave membership maps and member records inconsistent', async () => {
  await assertFails(
    updateDoc(familyRefFor(ADULT_UID), {
      [`memberUids.${NEW_MEMBER_UID}`]: true,
      lastMembershipMutation: {
        action: 'add',
        uid: NEW_MEMBER_UID,
        role: 'child',
        member: newChild,
      },
    })
  );
});

test('an authorized adult cannot remove or demote the owner', async () => {
  await assertFails(
    updateDoc(familyRefFor(ADULT_UID), {
      [`memberUids.${OWNER_UID}`]: deleteField(),
      [`adultUids.${OWNER_UID}`]: deleteField(),
      members: arrayRemove(owner),
    })
  );
});

test('an ordinary member can update non-membership family data', async () => {
  await assertSucceeds(updateDoc(familyRefFor(CHILD_UID), { familyName: 'Updated family name' }));
});

test('a user can join only by atomically redeeming a valid invite', async () => {
  const code = 'VALID123';
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'inviteCodes', code), {
      code,
      familyId: FAMILY_ID,
      role: 'child',
      createdByUid: OWNER_UID,
      usedByUid: null,
      expiresAtMs: Date.now() + 60_000,
    });
  });

  const db = testEnv.authenticatedContext(NEW_MEMBER_UID).firestore();
  const batch = writeBatch(db);
  batch.update(doc(db, 'families', FAMILY_ID), {
    [`memberUids.${NEW_MEMBER_UID}`]: true,
    members: arrayUnion(newChild),
    lastMembershipInviteCode: code,
  });
  batch.update(doc(db, 'inviteCodes', code), {
    usedByUid: NEW_MEMBER_UID,
    usedAt: serverTimestamp(),
  });

  await assertSucceeds(batch.commit());
});

test('a member can edit their own profile fields', async () => {
  const editedChild = {
    ...child,
    name: 'Updated child',
    color: '#123456',
    profileImagePath: `families/${FAMILY_ID}/profiles/${CHILD_UID}/avatar`,
    profileImageUpdatedAt: '2026-07-13T00:00:00.000Z',
  };
  await assertSucceeds(
    updateDoc(familyRefFor(CHILD_UID), {
      members: [owner, editedChild, adult],
      lastProfileMutation: { action: 'update', before: child, after: editedChild },
    })
  );
});

test('a profile edit cannot change account status or owner status', async () => {
  const forgedChild = { ...child, accountStatus: 'local' };
  await assertFails(
    updateDoc(familyRefFor(CHILD_UID), {
      ownerUid: CHILD_UID,
      members: [owner, forgedChild, adult],
      lastProfileMutation: { action: 'update', before: child, after: forgedChild },
    })
  );
});

test('a profile image reference must stay in the member secure storage path', async () => {
  const forgedChild = {
    ...child,
    profileImagePath: `families/${FAMILY_ID}/profiles/${OUTSIDER_UID}/avatar`,
  };
  await assertFails(
    updateDoc(familyRefFor(CHILD_UID), {
      members: [owner, forgedChild, adult],
      lastProfileMutation: { action: 'update', before: child, after: forgedChild },
    })
  );
});

test('an adult can create, edit, and delete a local child profile', async () => {
  const familyRef = familyRefFor(ADULT_UID);
  await assertSucceeds(
    updateDoc(familyRef, {
      members: [owner, child, adult, localChild],
      lastProfileMutation: { action: 'create', after: localChild },
    })
  );

  const editedLocalChild = { ...localChild, name: 'Edited local child' };
  await assertSucceeds(
    updateDoc(familyRef, {
      members: [owner, child, adult, editedLocalChild],
      lastProfileMutation: { action: 'update', before: localChild, after: editedLocalChild },
    })
  );

  await assertSucceeds(
    updateDoc(familyRef, {
      members: [owner, child, adult],
      lastProfileMutation: { action: 'delete', before: editedLocalChild },
    })
  );
});

test('a profile edit cannot change a member UID', async () => {
  const forgedChild = { ...child, uid: OUTSIDER_UID, name: 'Forged child' };
  await assertFails(
    updateDoc(familyRefFor(CHILD_UID), {
      members: [owner, forgedChild, adult],
      lastProfileMutation: { action: 'update', before: child, after: forgedChild },
    })
  );
});

test('a profile edit cannot change role or adult status', async () => {
  const promotedChild = { ...child, role: 'adult' };
  await assertFails(
    updateDoc(familyRefFor(CHILD_UID), {
      members: [owner, promotedChild, adult],
      [`adultUids.${CHILD_UID}`]: true,
      lastProfileMutation: { action: 'update', before: child, after: promotedChild },
    })
  );
});

test('a profile edit cannot add or remove family members', async () => {
  const editedChild = { ...child, name: 'Edited child' };
  await assertFails(
    updateDoc(familyRefFor(CHILD_UID), {
      members: [owner, editedChild, adult, localChild],
      lastProfileMutation: { action: 'update', before: child, after: editedChild },
    })
  );
  await assertFails(
    updateDoc(familyRefFor(CHILD_UID), {
      members: [editedChild, adult],
      lastProfileMutation: { action: 'update', before: child, after: editedChild },
    })
  );
});

test('a profile edit cannot alter membership maps', async () => {
  const editedChild = { ...child, name: 'Edited child' };
  await assertFails(
    updateDoc(familyRefFor(CHILD_UID), {
      members: [owner, editedChild, adult],
      [`memberUids.${OUTSIDER_UID}`]: true,
      lastProfileMutation: { action: 'update', before: child, after: editedChild },
    })
  );
});

test('an ordinary member cannot edit another authenticated profile', async () => {
  const editedOwner = { ...owner, name: 'Unauthorized owner edit' };
  await assertFails(
    updateDoc(familyRefFor(CHILD_UID), {
      members: [editedOwner, child, adult],
      lastProfileMutation: { action: 'update', before: owner, after: editedOwner },
    })
  );
});

test('cross-family profile edits are denied', async () => {
  const otherFamilyId = 'family-two';
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'families', otherFamilyId), {
      familyName: 'Other family',
      ownerUid: OUTSIDER_UID,
      memberUids: { [OUTSIDER_UID]: true },
      adultUids: { [OUTSIDER_UID]: true },
      members: [{ ...owner, id: OUTSIDER_UID, uid: OUTSIDER_UID }],
    });
  });
  const forgedOwner = { ...owner, id: OUTSIDER_UID, uid: OUTSIDER_UID };
  const editedOwner = { ...forgedOwner, name: 'Cross-family edit' };
  const otherRef = doc(testEnv.authenticatedContext(CHILD_UID).firestore(), 'families', otherFamilyId);
  await assertFails(
    updateDoc(otherRef, {
      members: [editedOwner],
      lastProfileMutation: { action: 'update', before: forgedOwner, after: editedOwner },
    })
  );
});
