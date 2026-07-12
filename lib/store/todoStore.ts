import { create } from 'zustand';
import { createJSONStorage, persist, subscribeWithSelector } from 'zustand/middleware';
import { firebaseEnabled } from '@/lib/config/firebase';
import {
  createEmptyFamilyState,
  createFamilyDocument,
  joinFamilyByInviteCode,
  publishInviteCode,
  saveFamilyState,
  subscribeToUserFamily,
  type RemoteFamilyUser,
} from '@/features/family/services/familyFirestore';
import type { FamilyMessage } from '@/features/chat/chat.types';
import type { FamilyInvite, FamilyMember, FamilyRole, FamilyState } from '@/features/family/family.types';
import type { TaskCategory, TaskPriority, TodoItem } from '@/features/tasks/tasks.types';

interface RemoteContext {
  enabled: boolean;
  userId?: string;
  familyId?: string;
}

interface TodoStoreState {
  state: FamilyState;
  remote: RemoteContext;
  familyLoading: boolean;
  familyError: string | null;
  addTodo: (title: string, assigneeId?: string, dueDateTime?: string, category?: TaskCategory, priority?: TaskPriority, requiresApproval?: boolean, reminderMinutesBefore?: number) => void;
  updateTodo: (todo: TodoItem) => void;
  toggleTodo: (todo: TodoItem) => void;
  deleteTodo: (id: string) => void;
  approveTodo: (taskId: string, adultId: string) => void;
  addMessage: (senderId: string, text: string, linkedTaskId?: string) => void;
  addMember: (name: string, role: FamilyRole, color: string) => void;
  updateMember: (member: FamilyMember) => void;
  updateMemberLocation: (memberId: string, locationLabel: string, latitude?: number, longitude?: number, accuracyMeters?: number) => void;
  createFamily: (familyName: string, adultName: string) => void;
  createFamilyForUser: (user: RemoteFamilyUser, familyName: string, adultName: string) => Promise<void>;
  joinFamilyByCode: (user: RemoteFamilyUser, code: string, displayName: string) => Promise<void>;
  updateFamilyName: (familyName: string) => void;
  createInvite: (role: FamilyRole, recipient?: string) => FamilyInvite;
  setState: (newState: FamilyState) => void;
  applyRemoteState: (newState: FamilyState) => void;
  connectRemoteUser: (user: RemoteFamilyUser) => (() => void) | undefined;
  disconnectRemoteUser: () => void;
}

const initialsFor = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();

const errorMessageFor = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    if (error.message.includes('permission-denied') || error.message.includes('Missing or insufficient permissions')) {
      return 'Firebase nekter skriving. Deploy Firestore-reglene før du oppretter familie.';
    }

    return error.message;
  }

  return fallback;
};

export const useTodoStore = create<TodoStoreState>()(
  subscribeWithSelector(
    persist(
      (set, get) => {
        const commitState = (nextState: FamilyState) => {
          set({ state: nextState, familyError: null });
          const { remote } = get();

          if (remote.enabled && nextState.familyId) {
            void saveFamilyState(nextState).catch((error) => {
              set({ familyError: errorMessageFor(error, 'Kunne ikke lagre familien.') });
            });
          }
        };

        const createLocalFamily = (familyName: string, adultName: string, userId = 'demo-user') => {
          const trimmedFamilyName = familyName.trim();
          const trimmedAdultName = adultName.trim();
          if (!trimmedFamilyName || !trimmedAdultName) return;

          const ownerMember: FamilyMember = {
            id: userId,
            uid: userId,
            name: trimmedAdultName,
            role: 'adult',
            color: '#007c89',
            avatar: initialsFor(trimmedAdultName),
            accountStatus: 'local',
            status: 'Tilgjengelig',
            locationLabel: 'Ikke delt',
            locationUpdatedAt: new Date().toISOString(),
            latitude: 59.9139,
            longitude: 10.7522,
          };

          commitState({
            familyId: `local-${userId}`,
            familyName: trimmedFamilyName,
            isSetupComplete: true,
            ownerUid: userId,
            memberUids: { [userId]: true },
            adultUids: { [userId]: true },
            members: [ownerMember],
            todos: [],
            messages: [],
            invites: [],
          });
        };

        return {
          state: createEmptyFamilyState(),
          remote: { enabled: false },
          familyLoading: false,
          familyError: null,

          setState: commitState,

          applyRemoteState: (newState) => {
            set({
              state: newState,
              familyLoading: false,
              familyError: null,
              remote: {
                ...get().remote,
                enabled: true,
                familyId: newState.familyId,
              },
            });
          },

          connectRemoteUser: (user) => {
            if (!firebaseEnabled || user.isDemo) {
              set({ familyLoading: false, familyError: null, remote: { enabled: false, userId: user.id } });
              return undefined;
            }

            set({ familyLoading: true, familyError: null, remote: { enabled: true, userId: user.id } });

            try {
              return subscribeToUserFamily(
                user.id,
                (nextState) => get().applyRemoteState(nextState),
                (message) => set({ familyLoading: false, familyError: message })
              );
            } catch (error) {
              set({
                familyLoading: false,
                familyError: errorMessageFor(error, 'Kunne ikke koble til Firebase.'),
              });
              return undefined;
            }
          },

          disconnectRemoteUser: () => {
            set({ familyLoading: false, familyError: null, remote: { enabled: false } });
          },

          addTodo: (title, assigneeId, dueDateTime, category = 'home', priority = 'normal', requiresApproval = false, reminderMinutesBefore) => {
            const state = get().state;
            const creator = state.members.find((member) => member.role === 'adult') || state.members[0];
            const fallbackMemberId = state.members[0]?.id || get().remote.userId || 'local-user';
            const newTodo: TodoItem = {
              id: crypto.randomUUID(),
              title,
              completed: false,
              assigneeId: assigneeId || fallbackMemberId,
              createdById: creator?.id || fallbackMemberId,
              category,
              priority,
              requiresApproval,
              reminderMinutesBefore,
              dueDateTime,
            };
            commitState({ ...state, todos: [...state.todos, newTodo] });
          },

          updateTodo: (updated) => {
            const state = get().state;
            const todos = state.todos.map((todo) => (todo.id === updated.id ? updated : todo));
            commitState({ ...state, todos });
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
            const todos = state.todos.filter((todo) => todo.id !== id);
            commitState({ ...state, todos });
          },

          approveTodo: (taskId, adultId) => {
            const state = get().state;
            const todo = state.todos.find((item) => item.id === taskId);
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
            commitState({ ...state, messages: [...state.messages, message] });
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
              avatar: initialsFor(trimmed),
              status: role === 'adult' ? 'Tilgjengelig' : 'Hjemme',
              locationLabel: 'Ikke delt',
              locationUpdatedAt: new Date().toISOString(),
              latitude: 59.9139,
              longitude: 10.7522,
            };
            commitState({ ...state, members: [...state.members, member] });
          },

          updateMember: (updated) => {
            const state = get().state;
            const members = state.members.map((member) => (member.id === updated.id ? updated : member));
            commitState({ ...state, members });
          },

          updateMemberLocation: (memberId, locationLabel, latitude, longitude, accuracyMeters) => {
            const state = get().state;
            const hasLatitude = typeof latitude === 'number' && Number.isFinite(latitude);
            const hasLongitude = typeof longitude === 'number' && Number.isFinite(longitude);
            const hasAccuracy = typeof accuracyMeters === 'number' && Number.isFinite(accuracyMeters);
            const members = state.members.map((member) =>
              member.id === memberId
                ? {
                    ...member,
                    locationLabel,
                    locationUpdatedAt: new Date().toISOString(),
                    latitude: hasLatitude ? latitude : member.latitude,
                    longitude: hasLongitude ? longitude : member.longitude,
                    locationAccuracyMeters: hasAccuracy ? accuracyMeters : member.locationAccuracyMeters,
                  }
                : member
            );
            commitState({ ...state, members });
          },

          createFamily: (familyName, adultName) => {
            createLocalFamily(familyName, adultName, get().remote.userId || 'demo-user');
          },

          createFamilyForUser: async (user, familyName, adultName) => {
            if (!firebaseEnabled || user.isDemo) {
              createLocalFamily(familyName, adultName, user.id);
              return;
            }

            set({ familyLoading: true, familyError: null });
            try {
              const nextState = await createFamilyDocument(user, familyName, adultName);
              set({
                state: nextState,
                familyLoading: false,
                familyError: null,
                remote: { enabled: true, userId: user.id, familyId: nextState.familyId },
              });
            } catch (error) {
              set({
                familyLoading: false,
                familyError: errorMessageFor(error, 'Kunne ikke opprette familie.'),
              });
              throw error;
            }
          },

          joinFamilyByCode: async (user, code, displayName) => {
            if (!firebaseEnabled || user.isDemo) {
              set({ familyError: 'Invitasjonskoder krever Firebase.' });
              return;
            }

            set({ familyLoading: true, familyError: null });
            try {
              await joinFamilyByInviteCode(user, code, displayName);
              set({ familyLoading: false, familyError: null });
            } catch (error) {
              set({
                familyLoading: false,
                familyError: errorMessageFor(error, 'Kunne ikke bli med i familien.'),
              });
              throw error;
            }
          },

          updateFamilyName: (familyName) => {
            const trimmed = familyName.trim();
            if (!trimmed) return;
            const state = get().state;
            commitState({ ...state, familyName: trimmed });
          },

          createInvite: (role, recipient = '') => {
            const state = get().state;
            const now = new Date();
            const expires = new Date(now);
            expires.setDate(expires.getDate() + 7);

            const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            const invite: FamilyInvite = {
              id: crypto.randomUUID(),
              code: Array.from({ length: 8 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join(''),
              familyId: state.familyId || `local-${get().remote.userId || 'demo-user'}`,
              role,
              recipient: recipient.trim() || undefined,
              createdAt: now.toISOString(),
              expiresAt: expires.toISOString(),
              createdById: get().remote.userId,
            };

            commitState({ ...state, invites: [invite, ...state.invites] });

            if (get().remote.enabled) {
              void publishInviteCode(invite, get().remote.userId).catch((error) => {
                set({ familyError: errorMessageFor(error, 'Kunne ikke publisere invitasjonen.') });
              });
            }

            return invite;
          },
        };
      },
      {
        name: 'tadoo-family-state',
        storage: createJSONStorage(() => localStorage),
        partialize: (store) => ({ state: store.state }),
      }
    )
  )
);
