import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

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
      longitude: 10.7522,
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
      longitude: 10.7587,
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
      longitude: 10.7308,
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
      longitude: 10.7147,
    },
  ],
  todos: [],
  messages: [],
  invites: [],
};

interface TodoStoreState {
  state: FamilyState;
  addTodo: (title: string, assigneeId?: string, dueDateTime?: string, category?: TaskCategory, priority?: TaskPriority, requiresApproval?: boolean, reminderMinutesBefore?: number) => void;
  updateTodo: (todo: TodoItem) => void;
  toggleTodo: (todo: TodoItem) => void;
  deleteTodo: (id: string) => void;
  approveTodo: (taskId: string, adultId: string) => void;
  addMessage: (senderId: string, text: string, linkedTaskId?: string) => void;
  addMember: (name: string, role: FamilyRole, color: string) => void;
  updateMember: (member: FamilyMember) => void;
  updateMemberLocation: (memberId: string, locationLabel: string) => void;
  createFamily: (familyName: string, adultName: string) => void;
  updateFamilyName: (familyName: string) => void;
  createInvite: (role: FamilyRole, recipient?: string) => FamilyInvite;
  setState: (newState: FamilyState) => void;
}

export const useTodoStore = create<TodoStoreState>()(subscribeWithSelector((set, get) => ({
  state: initialState,

  setState: (newState) => set({ state: newState }),

  addTodo: (title, assigneeId, dueDateTime, category = 'home', priority = 'normal', requiresApproval = false, reminderMinutesBefore) => {
    const state = get().state;
    const creator = state.members.find(m => m.role === 'adult') || state.members[0];
    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      assigneeId: assigneeId || state.members[0]?.id || 'robert',
      createdById: creator?.id || 'robert',
      category,
      priority,
      requiresApproval,
      reminderMinutesBefore,
      dueDateTime,
    };
    set({ state: { ...state, todos: [...state.todos, newTodo] } });
  },

  updateTodo: (updated) => {
    const state = get().state;
    const todos = state.todos.map(todo => (todo.id === updated.id ? updated : todo));
    set({ state: { ...state, todos } });
  },

  toggleTodo: (todo) => {
    get().updateTodo({
      ...todo,
      completed: !todo.completed,
      approvedById: !todo.completed && todo.requiresApproval ? undefined : todo.approvedById,
    });
  },

  deleteTodo: (id) => {
    const state = get().state;
    const todos = state.todos.filter(todo => todo.id !== id);
    set({ state: { ...state, todos } });
  },

  approveTodo: (taskId, adultId) => {
    const state = get().state;
    const todo = state.todos.find(item => item.id === taskId);
    if (!todo) return;
    get().updateTodo({ ...todo, completed: true, approvedById: adultId });
  },

  addMessage: (senderId, text, linkedTaskId) => {
    const state = get().state;
    const trimmed = text.trim();
    if (!trimmed) return;
    const message: FamilyMessage = {
      id: crypto.randomUUID(),
      senderId,
      text: trimmed,
      linkedTaskId,
      sentAt: new Date().toISOString(),
    };
    set({ state: { ...state, messages: [...state.messages, message] } });
  },

  addMember: (name, role, color) => {
    const state = get().state;
    const trimmed = name.trim();
    if (!trimmed) return;
    const member: FamilyMember = {
      id: crypto.randomUUID(),
      accountStatus: 'local',
      name: trimmed,
      role,
      color,
      avatar: name.split(/\s+/).map(p => p[0]).join('').slice(0, 3).toUpperCase(),
      status: role === 'adult' ? 'Tilgjengelig' : 'Hjemme',
      locationLabel: 'Ikke delt',
      locationUpdatedAt: new Date().toISOString(),
      latitude: 59.9139,
      longitude: 10.7522,
    };
    set({ state: { ...state, members: [...state.members, member] } });
  },

  updateMember: (updated) => {
    const state = get().state;
    const members = state.members.map(member =>
      member.id === updated.id ? updated : member
    );
    set({ state: { ...state, members } });
  },

  updateMemberLocation: (memberId, locationLabel) => {
    const state = get().state;
    const members = state.members.map(member =>
      member.id === memberId
        ? { ...member, locationLabel, locationUpdatedAt: new Date().toISOString() }
        : member
    );
    set({ state: { ...state, members } });
  },

  createFamily: (familyName, adultName) => {
    const trimmedFamilyName = familyName.trim();
    const trimmedAdultName = adultName.trim();
    if (!trimmedFamilyName || !trimmedAdultName) return;

    const ownerMember: FamilyMember = {
      id: 'demo-user',
      name: trimmedAdultName,
      role: 'adult',
      color: '#007c89',
      avatar: trimmedAdultName.split(/\s+/).map(p => p[0]).join('').slice(0, 3).toUpperCase(),
      accountStatus: 'local',
      status: 'Tilgjengelig',
      locationLabel: 'Ikke delt',
      locationUpdatedAt: new Date().toISOString(),
      latitude: 59.9139,
      longitude: 10.7522,
    };

    set({
      state: {
        familyId: 'demo-family',
        familyName: trimmedFamilyName,
        isSetupComplete: true,
        ownerUid: 'demo-user',
        memberUids: { 'demo-user': true },
        adultUids: { 'demo-user': true },
        members: [ownerMember],
        todos: [],
        messages: [],
        invites: [],
      },
    });
  },

  updateFamilyName: (familyName) => {
    const trimmed = familyName.trim();
    if (!trimmed) return;
    const state = get().state;
    set({ state: { ...state, familyName: trimmed } });
  },

  createInvite: (role, recipient = '') => {
    const state = get().state;
    const now = new Date();
    const expires = new Date(now);
    expires.setDate(expires.getDate() + 7);

    const invite: FamilyInvite = {
      id: crypto.randomUUID(),
      code: Array.from({ length: 8 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]).join(''),
      familyId: state.familyId || 'demo-family',
      role,
      recipient: recipient.trim() || undefined,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    };

    set({ state: { ...state, invites: [invite, ...state.invites] } });
    return invite;
  },
})));
