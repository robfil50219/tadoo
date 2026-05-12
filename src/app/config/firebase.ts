import type { FirebaseOptions } from 'firebase/app';

export const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyAIbbTH1w8Y4uttiMS2-yKg0QQQQ7IkjNA',
  authDomain: 'tadoo-app.firebaseapp.com',
  projectId: 'tadoo-app',
  storageBucket: 'tadoo-app.firebasestorage.app',
  messagingSenderId: '799958420175',
  appId: '1:799958420175:web:85822926bda3b85abdc5ba',
  measurementId: 'G-3WYTEQ8EJN'
};

export const firebaseEnabled = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

export const demoFamilyId = 'demo-family';
