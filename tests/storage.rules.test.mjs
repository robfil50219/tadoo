import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import test, { after, before, beforeEach } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadString } from 'firebase/storage';

const PROJECT_ID = process.env.GCLOUD_PROJECT || 'tadoo-app';
const FAMILY_ID = 'family-one';
const OTHER_FAMILY_ID = 'family-two';
const PARENT_UID = 'parent-one';
const CHILD_UID = 'child-one';
const OUTSIDER_UID = 'outsider';
const CHILD_PROFILE_PATH = `families/${FAMILY_ID}/profiles/${CHILD_UID}/avatar.png`;
const LOCAL_CHILD_PROFILE_PATH = `families/${FAMILY_ID}/local-profiles/local-child/avatar`;

let testEnv;

before(async () => {
  console.log('setup checkpoint 1: before reading rules');
  const [firestoreRules, storageRules] = await Promise.all([
    readFile('firestore.rules', 'utf8'),
    readFile('storage.rules', 'utf8'),
  ]);

  console.log('setup checkpoint 2: before initializeTestEnvironment');
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { host: '127.0.0.1', port: 8080, rules: firestoreRules },
    storage: { host: '127.0.0.1', port: 9199, rules: storageRules },
  });
  console.log('setup checkpoint 3: after initializeTestEnvironment');
});

beforeEach(async () => {
  console.log('hook checkpoint 1: before clearFirestore');
  await testEnv.clearFirestore();
  console.log('hook checkpoint 2: before seeding membership');

  await testEnv.withSecurityRulesDisabled(async (context) => {
    await Promise.all([
      setDoc(doc(context.firestore(), 'families', FAMILY_ID), {
        memberUids: { [PARENT_UID]: true, [CHILD_UID]: true },
        adultUids: { [PARENT_UID]: true },
      }),
      setDoc(doc(context.firestore(), 'families', OTHER_FAMILY_ID), {
        memberUids: { [OUTSIDER_UID]: true },
        adultUids: { [OUTSIDER_UID]: true },
      }),
    ]);
  });
  console.log('hook checkpoint 3: after seeding membership');
});

after(async () => {
  console.log('cleanup checkpoint 1: before cleanup');
  await testEnv?.cleanup();
  console.log('cleanup checkpoint 2: after cleanup');
});

const uploadChildProfile = () => {
  const storage = testEnv.authenticatedContext(CHILD_UID).storage();
  return uploadString(ref(storage, CHILD_PROFILE_PATH), 'avatar', 'raw', { contentType: 'image/png' });
};

test('a member can read a child profile in their own family', async () => {
  await assertSucceeds(uploadChildProfile());
  const storage = testEnv.authenticatedContext(PARENT_UID).storage();
  await assertSucceeds(getDownloadURL(ref(storage, CHILD_PROFILE_PATH)));
});

test('a member of another family cannot read a child profile', async () => {
  await assertSucceeds(uploadChildProfile());
  const storage = testEnv.authenticatedContext(OUTSIDER_UID).storage();
  await assertFails(getDownloadURL(ref(storage, CHILD_PROFILE_PATH)));
});

test('cross-family access stays denied after attempted membership manipulation', async () => {
  await assertSucceeds(uploadChildProfile());
  const outsiderFirestore = testEnv.authenticatedContext(OUTSIDER_UID).firestore();
  await assertFails(
    updateDoc(doc(outsiderFirestore, 'families', FAMILY_ID), {
      [`memberUids.${OUTSIDER_UID}`]: true,
    })
  );

  const outsiderStorage = testEnv.authenticatedContext(OUTSIDER_UID).storage();
  await assertFails(getDownloadURL(ref(outsiderStorage, CHILD_PROFILE_PATH)));
});

test('an unauthenticated user cannot read a child profile', async () => {
  await assertSucceeds(uploadChildProfile());
  const storage = testEnv.unauthenticatedContext().storage();
  await assertFails(getDownloadURL(ref(storage, CHILD_PROFILE_PATH)));
});

test('a profile owner can upload and delete their own image', async () => {
  const storage = testEnv.authenticatedContext(CHILD_UID).storage();
  const profile = ref(storage, CHILD_PROFILE_PATH);

  await assertSucceeds(uploadString(profile, 'new avatar', 'raw', { contentType: 'image/png' }));
  await assertSucceeds(deleteObject(profile));
});

test('a profile owner can replace their own image without exposing it cross-family', async () => {
  const ownerStorage = testEnv.authenticatedContext(CHILD_UID).storage();
  const profile = ref(ownerStorage, CHILD_PROFILE_PATH);
  await assertSucceeds(uploadString(profile, 'first image', 'raw', { contentType: 'image/png' }));
  await assertSucceeds(uploadString(profile, 'replacement image', 'raw', { contentType: 'image/webp' }));

  const outsiderStorage = testEnv.authenticatedContext(OUTSIDER_UID).storage();
  await assertFails(getDownloadURL(ref(outsiderStorage, CHILD_PROFILE_PATH)));

  await assertSucceeds(deleteObject(profile));
  await assert.rejects(getDownloadURL(profile), (error) => error?.code === 'storage/object-not-found');
});

test('an adult can upload, replace, and remove a local child image', async () => {
  const adultStorage = testEnv.authenticatedContext(PARENT_UID).storage();
  const profile = ref(adultStorage, LOCAL_CHILD_PROFILE_PATH);
  await assertSucceeds(uploadString(profile, 'first image', 'raw', { contentType: 'image/png' }));
  await assertSucceeds(uploadString(profile, 'replacement image', 'raw', { contentType: 'image/jpeg' }));
  await assertSucceeds(deleteObject(profile));
  await assert.rejects(getDownloadURL(profile), (error) => error?.code === 'storage/object-not-found');
});

test('a non-adult cannot upload or remove a local child image', async () => {
  const childStorage = testEnv.authenticatedContext(CHILD_UID).storage();
  const profile = ref(childStorage, LOCAL_CHILD_PROFILE_PATH);
  await assertFails(uploadString(profile, 'forged image', 'raw', { contentType: 'image/png' }));

  const adultStorage = testEnv.authenticatedContext(PARENT_UID).storage();
  await assertSucceeds(uploadString(ref(adultStorage, LOCAL_CHILD_PROFILE_PATH), 'image', 'raw', { contentType: 'image/png' }));
  await assertFails(deleteObject(profile));
});

test('another family member cannot overwrite a child profile', async () => {
  const storage = testEnv.authenticatedContext(PARENT_UID).storage();
  await assertFails(
    uploadString(ref(storage, CHILD_PROFILE_PATH), 'replacement', 'raw', { contentType: 'image/png' })
  );
});

test('a profile owner cannot upload a non-image file', async () => {
  const storage = testEnv.authenticatedContext(CHILD_UID).storage();
  await assertFails(
    uploadString(ref(storage, CHILD_PROFILE_PATH), 'not an image', 'raw', { contentType: 'text/plain' })
  );
});

test('a profile owner cannot upload an image at or above the 5 MB limit', async () => {
  const storage = testEnv.authenticatedContext(CHILD_UID).storage();
  const oversizedImage = 'x'.repeat(5 * 1024 * 1024);
  await assertFails(
    uploadString(ref(storage, CHILD_PROFILE_PATH), oversizedImage, 'raw', { contentType: 'image/png' })
  );
});
