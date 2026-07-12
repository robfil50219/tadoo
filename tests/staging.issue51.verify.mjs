import { initializeApp, deleteApp } from 'firebase/app';
import { createUserWithEmailAndPassword, deleteUser, getAuth } from 'firebase/auth';
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  deleteObject,
  getBytes,
  getStorage,
  listAll,
  ref,
  uploadBytes,
} from 'firebase/storage';

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (config.projectId !== 'tadoo-staging-robert') {
  throw new Error(`Refusing to test non-staging project: ${config.projectId || 'missing'}`);
}

const runId = `issue51-${Date.now()}`;
const password = `Tadoo-${crypto.randomUUID()}-Aa1!`;
const accounts = {};
const results = [];
const requestErrors = [];

const member = (uid, name, role = 'adult') => ({
  id: uid,
  uid,
  accountStatus: 'joined',
  name,
  role,
  color: role === 'adult' ? '#007c89' : '#f59e0b',
  avatar: name.slice(0, 2).toUpperCase(),
  status: role === 'adult' ? 'Available' : 'Home',
  locationLabel: 'Not shared',
  locationUpdatedAt: new Date().toISOString(),
  latitude: 59.9139,
  longitude: 10.7522,
});

const errorText = (error) => `${error?.code || error?.name || 'error'}: ${error?.message || String(error)}`;

const expectSuccess = async (name, expected, operation) => {
  try {
    const actual = await operation();
    results.push({ name, expected, actual: actual || 'Operation succeeded', pass: true, rulesError: null });
    return actual;
  } catch (error) {
    const message = errorText(error);
    requestErrors.push({ name, message });
    results.push({ name, expected, actual: message, pass: false, rulesError: message });
    return undefined;
  }
};

const expectDenied = async (name, expected, operation, unchangedCheck) => {
  try {
    await operation();
    results.push({ name, expected, actual: 'Operation unexpectedly succeeded', pass: false, unchanged: false });
  } catch (error) {
    const message = errorText(error);
    requestErrors.push({ name, message });
    let unchanged = true;
    let unchangedDetail = 'Denied operation made no data change';
    if (unchangedCheck) {
      try {
        unchanged = await unchangedCheck();
        unchangedDetail = unchanged ? 'Denied operation made no data change' : 'Data changed after denial';
      } catch (checkError) {
        unchanged = false;
        unchangedDetail = `Could not verify unchanged state: ${errorText(checkError)}`;
      }
    }
    results.push({
      name,
      expected,
      actual: `Denied with ${message}`,
      pass: unchanged,
      unchanged,
      unchangedDetail,
      rulesError: message,
    });
  }
};

const createAccount = async (label) => {
  const app = initializeApp(config, `${runId}-${label}`);
  const auth = getAuth(app);
  const email = `${runId}-${label}@example.com`;
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const account = {
    app,
    auth,
    user: credential.user,
    db: getFirestore(app),
    storage: getStorage(app),
    email,
  };
  accounts[label] = account;
  return account;
};

const createFamily = async (account, familyId, name) => {
  const owner = member(account.user.uid, name);
  const batch = writeBatch(account.db);
  batch.set(doc(account.db, 'families', familyId), {
    familyName: `${name} synthetic family`,
    isSetupComplete: true,
    ownerUid: account.user.uid,
    memberUids: { [account.user.uid]: true },
    adultUids: { [account.user.uid]: true },
    members: [owner],
    todos: [],
    messages: [],
    invites: [],
    syntheticRunId: runId,
  });
  batch.set(doc(account.db, 'userProfiles', account.user.uid), {
    familyId,
    memberId: account.user.uid,
    displayName: name,
    syntheticRunId: runId,
  });
  await batch.commit();
  return owner;
};

const familySnapshot = async (db, familyId) => (await getDoc(doc(db, 'families', familyId))).data();

const ownerA = await createAccount('owner-a');
const memberAAccount = await createAccount('member-a');
const ownerB = await createAccount('owner-b');
const outsider = await createAccount('outsider');
const familyAId = `${runId}-family-a`;
const familyBId = `${runId}-family-b`;
const ownerAMember = await createFamily(ownerA, familyAId, 'Owner A');
await createFamily(ownerB, familyBId, 'Owner B');

const imagePath = `families/${familyAId}/profiles/${ownerA.user.uid}/avatar.png`;
const imageRefA = ref(ownerA.storage, imagePath);
let imageSeeded = false;
await expectSuccess(
  '1. Family A profile owner uploads a permitted Family A image',
  'Authenticated profile owner and family member can upload a valid image',
  async () => {
    await uploadBytes(imageRefA, new Uint8Array([137, 80, 78, 71]), { contentType: 'image/png' });
    imageSeeded = true;
    return 'Family A profile image uploaded';
  }
);

await expectSuccess(
  '1. Family A member accesses permitted Family A profiles and images',
  'Family A document and image are readable',
  async () => {
    const family = await getDoc(doc(ownerA.db, 'families', familyAId));
    if (!family.exists()) throw new Error('Expected family data');
    if (imageSeeded) {
      const image = await getBytes(imageRefA);
      if (image.byteLength !== 4) throw new Error('Expected family image');
      return 'Family A document read; Family A image read';
    }
    return 'Family A document read; image read unavailable because owner upload failed';
  }
);

for (const [verb, operation] of [
  ['read', () => getBytes(ref(ownerB.storage, imagePath))],
  ['write/overwrite', () => uploadBytes(ref(ownerB.storage, imagePath), new Uint8Array([1]), { contentType: 'image/png' })],
  ['list', () => listAll(ref(ownerB.storage, `families/${familyAId}/profiles`))],
  ['delete', () => deleteObject(ref(ownerB.storage, imagePath))],
]) {
  await expectDenied(
    `2. Family B cannot ${verb} Family A images`,
    `${verb} is denied and the original image remains unchanged`,
    operation,
    async () => imageSeeded ? (await getBytes(imageRefA)).byteLength === 4 : true
  );
}
await expectDenied(
  '2. Family B cannot read or write Family A profiles',
  'Cross-family Firestore access is denied and Family A is unchanged',
  () => updateDoc(doc(ownerB.db, 'families', familyAId), { familyName: 'Compromised' }),
  async () => (await familySnapshot(ownerA.db, familyAId)).familyName === 'Owner A synthetic family'
);

await expectDenied(
  '3. Outsider cannot add themselves to Family A',
  'Self-add is denied and UID is absent',
  () => updateDoc(doc(outsider.db, 'families', familyAId), { [`memberUids.${outsider.user.uid}`]: true }),
  async () => !(outsider.user.uid in (await familySnapshot(ownerA.db, familyAId)).memberUids)
);

const inviteCode = `JOIN${Date.now()}`;
await setDoc(doc(ownerA.db, 'inviteCodes', inviteCode), {
  code: inviteCode,
  familyId: familyAId,
  role: 'child',
  createdByUid: ownerA.user.uid,
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
  expiresAtMs: Date.now() + 60_000,
  usedByUid: null,
});
const joinedMember = member(memberAAccount.user.uid, 'Member A', 'child');
await expectSuccess('5. Adult invite and intended join flow', 'Atomic invite redemption succeeds', async () => {
  const batch = writeBatch(memberAAccount.db);
  const current = await familySnapshot(ownerA.db, familyAId);
  batch.update(doc(memberAAccount.db, 'families', familyAId), {
    members: [...current.members, joinedMember],
    [`memberUids.${memberAAccount.user.uid}`]: true,
    lastMembershipInviteCode: inviteCode,
  });
  batch.set(doc(memberAAccount.db, 'userProfiles', memberAAccount.user.uid), {
    familyId: familyAId,
    memberId: memberAAccount.user.uid,
    displayName: 'Member A',
  });
  batch.update(doc(memberAAccount.db, 'inviteCodes', inviteCode), {
    usedByUid: memberAAccount.user.uid,
    usedAt: serverTimestamp(),
  });
  await batch.commit();
  const after = await familySnapshot(ownerA.db, familyAId);
  if (!after.memberUids[memberAAccount.user.uid]) throw new Error('Join membership missing');
  return 'Invite created by adult and atomically redeemed by joined member';
});

for (const [field, value] of [
  [`adultUids.${memberAAccount.user.uid}`, true],
  ['ownerUid', memberAAccount.user.uid],
  [`memberUids.${outsider.user.uid}`, true],
]) {
  await expectDenied(
    `4. Ordinary member cannot alter ${field}`,
    'Mutation is denied and protected fields remain unchanged',
    () => updateDoc(doc(memberAAccount.db, 'families', familyAId), { [field]: value }),
    async () => {
      const data = await familySnapshot(ownerA.db, familyAId);
      return data.ownerUid === ownerA.user.uid
        && !data.adultUids[memberAAccount.user.uid]
        && !data.memberUids[outsider.user.uid];
    }
  );
}

const expiredCode = `EXP${Date.now()}`;
await setDoc(doc(ownerA.db, 'inviteCodes', expiredCode), {
  code: expiredCode,
  familyId: familyAId,
  role: 'child',
  createdByUid: ownerA.user.uid,
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 1_200).toISOString(),
  expiresAtMs: Date.now() + 1_200,
  usedByUid: null,
});
await new Promise((resolve) => setTimeout(resolve, 1_500));
await expectDenied(
  '6. Expired invite is rejected',
  'Expired invite cannot add outsider membership',
  async () => {
    const current = await familySnapshot(ownerA.db, familyAId);
    const outsiderMember = member(outsider.user.uid, 'Outsider', 'child');
    const batch = writeBatch(outsider.db);
    batch.update(doc(outsider.db, 'families', familyAId), {
      members: [...current.members, outsiderMember],
      [`memberUids.${outsider.user.uid}`]: true,
      lastMembershipInviteCode: expiredCode,
    });
    batch.update(doc(outsider.db, 'inviteCodes', expiredCode), {
      usedByUid: outsider.user.uid,
      usedAt: serverTimestamp(),
    });
    await batch.commit();
  },
  async () => !(outsider.user.uid in (await familySnapshot(ownerA.db, familyAId)).memberUids)
);
await expectDenied(
  '6. Invalid invite is rejected',
  'Missing invite cannot add outsider membership',
  async () => {
    const current = await familySnapshot(ownerA.db, familyAId);
    const outsiderMember = member(outsider.user.uid, 'Outsider', 'child');
    await updateDoc(doc(outsider.db, 'families', familyAId), {
      members: [...current.members, outsiderMember],
      [`memberUids.${outsider.user.uid}`]: true,
      lastMembershipInviteCode: 'DOES-NOT-EXIST',
    });
  },
  async () => !(outsider.user.uid in (await familySnapshot(ownerA.db, familyAId)).memberUids)
);

const editedJoinedMember = { ...joinedMember, name: 'Member A Edited', color: '#123456' };
await expectSuccess('7. Joined member edits authorized profile fields', 'Own name and color edit succeeds', async () => {
  const current = await familySnapshot(memberAAccount.db, familyAId);
  await updateDoc(doc(memberAAccount.db, 'families', familyAId), {
    members: current.members.map((entry) => entry.id === joinedMember.id ? editedJoinedMember : entry),
    lastProfileMutation: { action: 'update', before: joinedMember, after: editedJoinedMember },
  });
  return 'Joined member updated own name and color';
});
await expectDenied(
  '7. Joined member cannot edit another joined profile',
  'Owner profile edit is denied and owner name remains unchanged',
  async () => {
    const current = await familySnapshot(memberAAccount.db, familyAId);
    const forgedOwner = { ...ownerAMember, name: 'Forged owner' };
    await updateDoc(doc(memberAAccount.db, 'families', familyAId), {
      members: current.members.map((entry) => entry.id === ownerAMember.id ? forgedOwner : entry),
      lastProfileMutation: { action: 'update', before: ownerAMember, after: forgedOwner },
    });
  },
  async () => (await familySnapshot(ownerA.db, familyAId)).members
    .find((entry) => entry.id === ownerA.user.uid).name === 'Owner A'
);

const localChild = {
  id: `${runId}-local-child`,
  accountStatus: 'local',
  name: 'Synthetic local child',
  role: 'child',
  color: '#abcdef',
  avatar: 'SC',
  status: 'Home',
  locationLabel: 'Not shared',
  locationUpdatedAt: new Date().toISOString(),
  latitude: 59.9139,
  longitude: 10.7522,
};
await expectSuccess('8. Adult creates local profile', 'Local profile create succeeds', async () => {
  const current = await familySnapshot(ownerA.db, familyAId);
  await updateDoc(doc(ownerA.db, 'families', familyAId), {
    members: [...current.members, localChild],
    lastProfileMutation: { action: 'create', after: localChild },
  });
  return 'Local child profile created';
});
const editedLocalChild = { ...localChild, name: 'Edited synthetic child' };
await expectSuccess('8. Adult edits local profile', 'Local profile edit succeeds', async () => {
  const current = await familySnapshot(ownerA.db, familyAId);
  await updateDoc(doc(ownerA.db, 'families', familyAId), {
    members: current.members.map((entry) => entry.id === localChild.id ? editedLocalChild : entry),
    lastProfileMutation: { action: 'update', before: localChild, after: editedLocalChild },
  });
  return 'Local child profile edited';
});
await expectDenied(
  '9. Local profile cannot become authenticated through profile editing',
  'Adding UID/account status is denied and local record remains local',
  async () => {
    const current = await familySnapshot(ownerA.db, familyAId);
    const converted = { ...editedLocalChild, uid: outsider.user.uid, accountStatus: 'joined' };
    await updateDoc(doc(ownerA.db, 'families', familyAId), {
      members: current.members.map((entry) => entry.id === editedLocalChild.id ? converted : entry),
      lastProfileMutation: { action: 'update', before: editedLocalChild, after: converted },
    });
  },
  async () => {
    const record = (await familySnapshot(ownerA.db, familyAId)).members.find((entry) => entry.id === localChild.id);
    return record.accountStatus === 'local' && !record.uid;
  }
);
await expectSuccess('8. Adult deletes local profile', 'Local profile delete succeeds', async () => {
  const current = await familySnapshot(ownerA.db, familyAId);
  await updateDoc(doc(ownerA.db, 'families', familyAId), {
    members: current.members.filter((entry) => entry.id !== editedLocalChild.id),
    lastProfileMutation: { action: 'delete', before: editedLocalChild },
  });
  return 'Local child profile deleted';
});

await expectDenied(
  '10. Membership manipulation does not grant Storage access',
  'Self-add and subsequent Family A image read remain denied',
  async () => {
    try {
      await updateDoc(doc(outsider.db, 'families', familyAId), { [`memberUids.${outsider.user.uid}`]: true });
    } catch {}
    await getBytes(ref(outsider.storage, imagePath));
  },
  async () => !(outsider.user.uid in (await familySnapshot(ownerA.db, familyAId)).memberUids)
    && (!imageSeeded || (await getBytes(imageRefA)).byteLength === 4)
);

await expectSuccess(
  '11. Existing non-sensitive family state updates still work',
  'Family name update succeeds while membership remains unchanged',
  async () => {
    const before = await familySnapshot(memberAAccount.db, familyAId);
    await updateDoc(doc(memberAAccount.db, 'families', familyAId), { familyName: 'Safe staging update' });
    const after = await familySnapshot(memberAAccount.db, familyAId);
    if (JSON.stringify(before.memberUids) !== JSON.stringify(after.memberUids)
      || JSON.stringify(before.adultUids) !== JSON.stringify(after.adultUids)) {
      throw new Error('Membership fields changed');
    }
    return 'Family name updated; membership maps unchanged';
  }
);

results.push({
  name: '12. Current legitimate client flows avoid permission-denied',
  expected: 'Create family, invite/join, profile edits, local profile lifecycle, Storage owner access, and ordinary state update succeed',
  actual: results.filter((entry) => ['1.', '5.', '7.', '8.', '11.'].some((prefix) => entry.name.startsWith(prefix)) && !entry.pass).length
    ? 'One or more legitimate client operations failed'
    : 'All exercised legitimate client API flows succeeded',
  pass: results.filter((entry) => ['1.', '5.', '7.', '8.', '11.'].some((prefix) => entry.name.startsWith(prefix)) && !entry.pass).length === 0,
  browserConsoleErrors: 'Not available: in-app browser automation surface was unavailable',
});

await deleteObject(imageRefA).catch(() => {});
for (const account of Object.values(accounts)) {
  await deleteUser(account.user).catch(() => {});
  await deleteApp(account.app).catch(() => {});
}

console.log(JSON.stringify({
  projectId: config.projectId,
  runId,
  syntheticAccounts: Object.values(accounts).map(({ email }) => email),
  results,
  requestErrors,
  passed: results.every((result) => result.pass),
}, null, 2));

if (!results.every((result) => result.pass)) process.exitCode = 1;
