import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
    doc,
    getDoc,
    getFirestore,
    onSnapshot,
    setDoc,
    type DocumentData,
    type Firestore
} from 'firebase/firestore';
import { firebaseConfig, firebaseEnabled } from '../config/firebase';
import { AuthService } from './auth';

export type FamilyRole = 'adult' | 'child';
export type TaskPriority = 'low' | 'normal' | 'high';
export type TaskCategory = 'home' | 'school' | 'activity' | 'health' | 'shopping';

export interface FamilyMember {
    id: string;
    uid?: string;
    email?: string;
    accountStatus: 'local' | 'invited' | 'joined';
    name: string;
    role: FamilyRole;
    color: string;
    avatar: string;
    status: string;
    locationLabel: string;
    locationUpdatedAt: string;
    latitude: number;
    longitude: number;
}

export interface TodoItem {
    id: string;
    title: string;
    completed: boolean;
    assigneeId: string;
    createdById: string;
    category: TaskCategory;
    priority: TaskPriority;
    reminderMinutesBefore?: number;
    requiresApproval: boolean;
    approvedById?: string;
    dueDateTime?: string;
}

export interface FamilyMessage {
    id: string;
    senderId: string;
    text: string;
    sentAt: string;
    linkedTaskId?: string;
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

const initialState: FamilyState = {
    familyId: 'demo-family',
    familyName: 'Familien Filep',
    isSetupComplete: true,
    ownerUid: 'demo-user',
    memberUids: { 'demo-user': true },
    adultUids: { 'demo-user': true },
    members: [
        {
            id: 'robert',
            accountStatus: 'local',
            name: 'Robert',
            role: 'adult',
            color: '#007c89',
            avatar: 'RF',
            status: 'På jobb',
            locationLabel: 'Kontoret',
            locationUpdatedAt: new Date().toISOString(),
            latitude: 59.9139,
            longitude: 10.7522
        },
        {
            id: 'maria',
            accountStatus: 'local',
            name: 'Maria',
            role: 'adult',
            color: '#7c3aed',
            avatar: 'MF',
            status: 'Hjemme',
            locationLabel: 'Hjemme',
            locationUpdatedAt: new Date().toISOString(),
            latitude: 59.9224,
            longitude: 10.7587
        },
        {
            id: 'emma',
            accountStatus: 'local',
            name: 'Emma',
            role: 'child',
            color: '#f59e0b',
            avatar: 'E',
            status: 'Skole',
            locationLabel: 'Skolen',
            locationUpdatedAt: new Date().toISOString(),
            latitude: 59.9183,
            longitude: 10.7308
        },
        {
            id: 'leo',
            accountStatus: 'local',
            name: 'Leo',
            role: 'child',
            color: '#16a34a',
            avatar: 'L',
            status: 'Fotball',
            locationLabel: 'Idrettsbanen',
            locationUpdatedAt: new Date().toISOString(),
            latitude: 59.9291,
            longitude: 10.7147
        }
    ],
    todos: [
        {
            id: 'task-dinner',
            title: 'Handle middag og melk',
            completed: false,
            assigneeId: 'robert',
            createdById: 'maria',
            category: 'shopping',
            priority: 'high',
            reminderMinutesBefore: 30,
            requiresApproval: false,
            dueDateTime: todayAt(16, 30)
        },
        {
            id: 'task-homework',
            title: 'Gjør matte-leksen ferdig',
            completed: false,
            assigneeId: 'emma',
            createdById: 'robert',
            category: 'school',
            priority: 'normal',
            reminderMinutesBefore: 60,
            requiresApproval: true,
            dueDateTime: todayAt(18, 0)
        },
        {
            id: 'task-kit',
            title: 'Pakk fotballbag',
            completed: true,
            assigneeId: 'leo',
            createdById: 'maria',
            category: 'activity',
            priority: 'normal',
            reminderMinutesBefore: 45,
            requiresApproval: true,
            approvedById: 'maria',
            dueDateTime: tomorrowAt(17, 15)
        }
    ],
    messages: [
        {
            id: 'msg-1',
            senderId: 'maria',
            text: 'Husk at Leo skal på trening kl. 17:30.',
            sentAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
            linkedTaskId: 'task-kit'
        },
        {
            id: 'msg-2',
            senderId: 'robert',
            text: 'Jeg tar handlingen på vei hjem.',
            sentAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
            linkedTaskId: 'task-dinner'
        }
    ],
    invites: []
};

function todayAt(hour: number, minute: number): string {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
}

function tomorrowAt(hour: number, minute: number): string {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
}

@Injectable({ providedIn: 'root' })
export class TodoService {
    private readonly STORAGE_KEY = 'tadoo-family-state';
    private firestore?: Firestore;
    private cloudReady = false;
    private currentFamilyId = '';
    private familyUnsubscribe?: () => void;
    private stateSubject = new BehaviorSubject<FamilyState>(this.loadFromStorage());
    public state$: Observable<FamilyState> = this.stateSubject.asObservable();
    public todos$: Observable<TodoItem[]> = new Observable(subscriber => {
        const subscription = this.state$.subscribe(state => subscriber.next(state.todos));
        return () => subscription.unsubscribe();
    });

    constructor(private authService: AuthService) {
        if (!firebaseEnabled) return;

        const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        this.firestore = getFirestore(app);
        this.stateSubject.next(this.emptyCloudState());

        this.authService.user$.subscribe(user => {
            if (!user || user.isDemo || !this.firestore) return;

            void this.loadFamilyForUser(user.id);
        });
    }

    private async loadFamilyForUser(uid: string) {
        if (!this.firestore) return;

        this.familyUnsubscribe?.();
        this.cloudReady = false;

        const profile = await getDoc(doc(this.firestore, 'userProfiles', uid));
        const familyId = profile.exists() ? profile.data()['familyId'] as string | undefined : undefined;

        if (!familyId) {
            const emptyState = this.emptyCloudState(uid);
            this.currentFamilyId = '';
            this.cloudReady = true;
            this.stateSubject.next(emptyState);
            localStorage.setItem(this.storageKeyForUser(uid), JSON.stringify(emptyState));
            return;
        }

        this.currentFamilyId = familyId;
        const familyRef = doc(this.firestore, 'families', familyId);

        this.familyUnsubscribe = onSnapshot(familyRef, snapshot => {
            this.cloudReady = true;
            if (snapshot.exists()) {
                const state = this.normalizeState(snapshot.data(), familyId);
                this.stateSubject.next(state);
                localStorage.setItem(this.storageKeyForUser(uid), JSON.stringify(state));
                return;
            }

            const emptyState = this.emptyCloudState(uid);
            this.stateSubject.next(emptyState);
        });
    }

    private storageKeyForUser(uid?: string): string {
        return uid ? `${this.STORAGE_KEY}-${uid}` : this.STORAGE_KEY;
    }

    private emptyCloudState(ownerUid = ''): FamilyState {
        return {
            familyId: '',
            familyName: '',
            isSetupComplete: false,
            ownerUid,
            memberUids: ownerUid ? { [ownerUid]: true } : {},
            adultUids: ownerUid ? { [ownerUid]: true } : {},
            members: [],
            todos: [],
            messages: [],
            invites: []
        };
    }

    private loadFromStorage(): FamilyState {
        const json = localStorage.getItem(this.STORAGE_KEY);
        if (!json) {
            return initialState;
        }

        try {
            const stored = JSON.parse(json) as Partial<FamilyState>;
            return {
                familyId: stored.familyId || initialState.familyId,
                familyName: stored.familyName || initialState.familyName,
                isSetupComplete: stored.isSetupComplete ?? initialState.isSetupComplete,
                ownerUid: stored.ownerUid || initialState.ownerUid,
                memberUids: stored.memberUids || initialState.memberUids,
                adultUids: stored.adultUids || initialState.adultUids,
                members: stored.members?.length ? stored.members : initialState.members,
                todos: stored.todos || [],
                messages: stored.messages || [],
                invites: stored.invites || []
            };
        } catch {
            return initialState;
        }
    }

    private saveState(state: FamilyState) {
        this.stateSubject.next(state);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
        this.saveToCloud(state);
    }

    private saveToCloud(state: FamilyState) {
        const user = this.authService.currentUser;
        if (!firebaseEnabled || !this.firestore || !this.cloudReady || !user || user.isDemo) return;
        if (!this.currentFamilyId && state.familyId) {
            this.currentFamilyId = state.familyId;
        }
        if (!this.currentFamilyId) return;

        void setDoc(doc(this.firestore, 'families', this.currentFamilyId), this.withCloudMembership(state));
    }

    private withCloudMembership(state: FamilyState): FamilyState {
        const user = this.authService.currentUser;
        if (!user || user.isDemo) return state;

        return {
            ...state,
            ownerUid: state.ownerUid || user.id,
            memberUids: {
                ...(state.memberUids || {}),
                [user.id]: true
            },
            adultUids: {
                ...(state.adultUids || {}),
                [user.id]: true
            }
        };
    }

    private patchState(patch: Partial<FamilyState>) {
        this.saveState({ ...this.stateSubject.value, ...patch });
    }

    hentState(): Observable<FamilyState> {
        return this.state$;
    }

    hentTodos(): Observable<TodoItem[]> {
        return this.todos$;
    }

    createFamily(familyName: string, adultName: string) {
        const user = this.authService.currentUser;
        const trimmedFamilyName = familyName.trim();
        const trimmedAdultName = adultName.trim();
        if (!trimmedFamilyName || !trimmedAdultName) return;

        const ownerUid = user?.id || 'demo-user';
        const familyId = firebaseEnabled && user && !user.isDemo ? crypto.randomUUID() : 'demo-family';
        const ownerMember: FamilyMember = {
            id: ownerUid,
            uid: ownerUid,
            email: user?.email,
            accountStatus: user && !user.isDemo ? 'joined' : 'local',
            name: trimmedAdultName,
            role: 'adult',
            color: '#007c89',
            avatar: this.initialsFor(trimmedAdultName),
            status: 'Tilgjengelig',
            locationLabel: 'Ikke delt',
            locationUpdatedAt: new Date().toISOString(),
            latitude: 59.9139,
            longitude: 10.7522
        };

        const state: FamilyState = {
            familyId,
            familyName: trimmedFamilyName,
            isSetupComplete: true,
            ownerUid,
            memberUids: { [ownerUid]: true },
            adultUids: { [ownerUid]: true },
            members: [ownerMember],
            todos: [],
            messages: [],
            invites: []
        };

        this.currentFamilyId = familyId;
        if (firebaseEnabled && this.firestore && user && !user.isDemo) {
            void setDoc(doc(this.firestore, 'userProfiles', ownerUid), {
                uid: ownerUid,
                email: user.email,
                familyId,
                memberId: ownerMember.id,
                role: 'adult'
            });
        }

        this.saveState(state);
    }

    createInvite(role: FamilyRole, recipient = ''): FamilyInvite {
        const now = new Date();
        const expires = new Date(now);
        expires.setDate(expires.getDate() + 7);

        const invite: FamilyInvite = {
            id: crypto.randomUUID(),
            code: this.inviteCode(),
            familyId: this.stateSubject.value.familyId || this.currentFamilyId || 'demo-family',
            role,
            recipient: recipient.trim() || undefined,
            createdById: this.authService.currentUser?.id,
            createdAt: now.toISOString(),
            expiresAt: expires.toISOString()
        };

        this.patchState({ invites: [invite, ...this.stateSubject.value.invites] });
        if (firebaseEnabled && this.firestore) {
            void setDoc(doc(this.firestore, 'inviteCodes', invite.code), invite);
        }
        return invite;
    }

    async acceptInvite(familyId: string, code: string, displayName: string): Promise<string> {
        const user = this.authService.currentUser;
        if (!user || user.isDemo || !this.firestore) {
            return 'Du må være logget inn for å godta invitasjonen.';
        }

        const inviteDoc = await getDoc(doc(this.firestore, 'inviteCodes', code));
        if (!inviteDoc.exists()) {
            return 'Invitasjonen finnes ikke eller er utløpt.';
        }

        const invite = inviteDoc.data() as FamilyInvite;
        if (invite.familyId !== familyId) {
            return 'Invitasjonen hører ikke til denne familien.';
        }

        if (new Date(invite.expiresAt).getTime() < Date.now()) {
            return 'Invitasjonen er utløpt.';
        }

        const familyRef = doc(this.firestore, 'families', familyId);
        const familySnapshot = await getDoc(familyRef);
        if (!familySnapshot.exists()) {
            return 'Fant ikke familien.';
        }

        const family = this.normalizeState(familySnapshot.data(), familyId);
        const name = displayName.trim() || user.name || user.email;
        const member: FamilyMember = {
            id: user.id,
            uid: user.id,
            email: user.email,
            accountStatus: 'joined',
            name,
            role: invite.role,
            color: invite.role === 'adult' ? '#007c89' : '#f59e0b',
            avatar: this.initialsFor(name),
            status: 'Tilgjengelig',
            locationLabel: 'Ikke delt',
            locationUpdatedAt: new Date().toISOString(),
            latitude: 59.9139,
            longitude: 10.7522
        };

        const withoutExisting = family.members.filter(item => item.uid !== user.id && item.email !== user.email);
        const updatedInvites = family.invites.map(item =>
            item.code === code ? { ...item, usedByUid: user.id } : item
        );
        const updatedFamily: FamilyState = {
            ...family,
            memberUids: { ...(family.memberUids || {}), [user.id]: true },
            adultUids: invite.role === 'adult'
                ? { ...(family.adultUids || {}), [user.id]: true }
                : { ...(family.adultUids || {}) },
            members: [...withoutExisting, member],
            invites: updatedInvites
        };

        await setDoc(familyRef, updatedFamily);
        await setDoc(doc(this.firestore, 'userProfiles', user.id), {
            uid: user.id,
            email: user.email,
            familyId,
            memberId: member.id,
            role: invite.role
        });

        this.currentFamilyId = familyId;
        this.stateSubject.next(updatedFamily);
        return '';
    }

    private inviteCode(): string {
        const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        return Array.from({ length: 8 }, () =>
            alphabet[Math.floor(Math.random() * alphabet.length)]
        ).join('');
    }

    updateFamilyName(familyName: string) {
        const trimmed = familyName.trim();
        if (!trimmed) return;

        this.patchState({ familyName: trimmed });
    }

    addMember(name: string, role: FamilyRole, color: string) {
        const trimmed = name.trim();
        if (!trimmed) return;

        const member: FamilyMember = {
            id: crypto.randomUUID(),
            accountStatus: 'local',
            name: trimmed,
            role,
            color,
            avatar: this.initialsFor(trimmed),
            status: role === 'adult' ? 'Tilgjengelig' : 'Hjemme',
            locationLabel: 'Ikke delt',
            locationUpdatedAt: new Date().toISOString(),
            latitude: 59.9139,
            longitude: 10.7522
        };

        this.patchState({ members: [...this.stateSubject.value.members, member] });
    }

    private normalizeState(data: DocumentData, familyId: string): FamilyState {
        return {
            familyId: data['familyId'] || familyId,
            familyName: data['familyName'] || '',
            isSetupComplete: data['isSetupComplete'] ?? false,
            ownerUid: data['ownerUid'],
            memberUids: data['memberUids'] || {},
            adultUids: data['adultUids'] || {},
            members: (data['members'] || []).map((member: Partial<FamilyMember>) => ({
                accountStatus: member.accountStatus || (member.uid ? 'joined' : 'local'),
                ...member
            })) as FamilyMember[],
            todos: data['todos'] || [],
            messages: data['messages'] || [],
            invites: data['invites'] || []
        };
    }

    private initialsFor(name: string): string {
        return name
            .split(/\s+/)
            .map(part => part[0])
            .join('')
            .slice(0, 3)
            .toUpperCase();
    }

    leggTil(
        title: string,
        assigneeId = this.stateSubject.value.members[0]?.id || 'robert',
        dueDateTime?: string,
        category: TaskCategory = 'home',
        priority: TaskPriority = 'normal',
        requiresApproval = false,
        reminderMinutesBefore?: number
    ) {
        const state = this.stateSubject.value;
        const creator = state.members.find(member => member.role === 'adult') || state.members[0];
        const newTodo: TodoItem = {
            id: crypto.randomUUID(),
            title,
            completed: false,
            assigneeId,
            createdById: creator?.id || assigneeId,
            category,
            priority,
            requiresApproval,
            reminderMinutesBefore,
            dueDateTime
        };

        this.patchState({ todos: [...state.todos, newTodo] });
    }

    oppdater(updated: TodoItem) {
        const todos = this.stateSubject.value.todos.map(todo =>
            todo.id === updated.id ? updated : todo
        );
        this.patchState({ todos });
    }

    toggleFullfort(todo: TodoItem) {
        this.oppdater({
            ...todo,
            completed: !todo.completed,
            approvedById: !todo.completed && todo.requiresApproval ? undefined : todo.approvedById
        });
    }

    godkjennOppgave(taskId: string, adultId: string) {
        const todo = this.stateSubject.value.todos.find(item => item.id === taskId);
        if (!todo) return;

        this.oppdater({ ...todo, completed: true, approvedById: adultId });
    }

    slett(id: string) {
        const todos = this.stateSubject.value.todos.filter(todo => todo.id !== id);
        this.patchState({ todos });
    }

    sendMessage(senderId: string, text: string, linkedTaskId?: string) {
        const trimmed = text.trim();
        if (!trimmed) return;

        const message: FamilyMessage = {
            id: crypto.randomUUID(),
            senderId,
            text: trimmed,
            linkedTaskId,
            sentAt: new Date().toISOString()
        };

        this.patchState({ messages: [...this.stateSubject.value.messages, message] });
    }

    updateMemberProfile(updated: FamilyMember) {
        const members = this.stateSubject.value.members.map(member =>
            member.id === updated.id
                ? {
                    ...updated,
                    name: updated.name.trim() || member.name,
                    avatar: updated.avatar.trim().slice(0, 3).toUpperCase() || member.avatar,
                    status: updated.status.trim() || 'Tilgjengelig',
                    locationLabel: updated.locationLabel.trim() || member.locationLabel,
                    locationUpdatedAt: updated.locationLabel.trim() !== member.locationLabel
                        ? new Date().toISOString()
                        : member.locationUpdatedAt
                }
                : member
        );
        this.patchState({ members });
    }

    updateMemberLocation(memberId: string, locationLabel: string) {
        const members = this.stateSubject.value.members.map(member =>
            member.id === memberId
                ? {
                    ...member,
                    locationLabel,
                    locationUpdatedAt: new Date().toISOString()
                }
                : member
        );
        this.patchState({ members });
    }
}
