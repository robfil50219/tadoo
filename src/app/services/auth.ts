import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User
} from 'firebase/auth';
import { firebaseConfig, firebaseEnabled } from '../config/firebase';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  isDemo: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<AppUser | null>(
    firebaseEnabled ? null : {
      id: 'demo-user',
      email: 'demo@tadoo.local',
      name: 'Demo familie',
      isDemo: true
    }
  );

  user$ = this.userSubject.asObservable();
  readonly enabled = firebaseEnabled;

  get currentUser(): AppUser | null {
    return this.userSubject.value;
  }

  constructor() {
    if (!firebaseEnabled) return;

    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);

    onAuthStateChanged(auth, (user: User | null) => {
      this.userSubject.next(user ? {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || user.email || 'Tadoo-bruker',
        isDemo: false
      } : null);
    });
  }

  async signIn(email: string, password: string) {
    if (!firebaseEnabled) return;

    const auth = getAuth(getApps().length ? getApp() : initializeApp(firebaseConfig));
    await signInWithEmailAndPassword(auth, email, password);
  }

  async register(email: string, password: string) {
    if (!firebaseEnabled) return;

    const auth = getAuth(getApps().length ? getApp() : initializeApp(firebaseConfig));
    await createUserWithEmailAndPassword(auth, email, password);
  }

  async logout() {
    if (!firebaseEnabled) {
      return;
    }

    await signOut(getAuth());
  }
}
