import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TodoListComponent } from './todo-list/todo-list';
import { CalendarComponent } from './calendar/calendar.component';
import {
  AppUser,
  AuthService
} from './services/auth';
import {
  FamilyMember,
  FamilyMessage,
  FamilyInvite,
  FamilyRole,
  FamilyState,
  TodoItem,
  TodoService
} from './services/todo';
import { AppLanguage, LanguageService } from './services/language';
import { Subscription } from 'rxjs';

type AppView = 'dashboard' | 'tasks' | 'calendar' | 'family' | 'chat' | 'location' | 'settings';
type NavLabelKey = 'dashboard' | 'tasks' | 'calendar' | 'family' | 'chat' | 'location' | 'settings';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TodoListComponent,
    CalendarComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit, OnDestroy {
  activeView: AppView = 'dashboard';
  showMobileMenu = false;
  state?: FamilyState;
  chatText = '';
  chatSenderId = '';
  locationMemberId = '';
  locationLabel = '';
  editingMemberId: string | null = null;
  profileDraft: FamilyMember | null = null;
  user: AppUser | null = null;
  authEmail = '';
  authPassword = '';
  authPasswordConfirm = '';
  authMode: 'login' | 'register' = 'login';
  authError = '';
  familyNameDraft = '';
  newMemberName = '';
  newMemberRole: FamilyRole = 'child';
  newMemberColor = '#007c89';
  setupFamilyName = '';
  setupAdultName = '';
  inviteRole: FamilyRole = 'adult';
  inviteRecipient = '';
  latestInvite: FamilyInvite | null = null;
  pendingInviteCode = '';
  pendingInviteFamilyId = '';
  inviteDisplayName = '';
  inviteError = '';
  private sub?: Subscription;
  private authSub?: Subscription;

  navItems: { id: AppView; labelKey: NavLabelKey }[] = [
    { id: 'dashboard', labelKey: 'dashboard' },
    { id: 'tasks', labelKey: 'tasks' },
    { id: 'calendar', labelKey: 'calendar' },
    { id: 'family', labelKey: 'family' },
    { id: 'chat', labelKey: 'chat' },
    { id: 'location', labelKey: 'location' },
    { id: 'settings', labelKey: 'settings' }
  ];

  constructor(
    private todoService: TodoService,
    public authService: AuthService,
    public language: LanguageService
  ) { }

  ngOnInit(): void {
    const params = new URLSearchParams(window.location.search);
    this.pendingInviteCode = params.get('invite') || '';
    this.pendingInviteFamilyId = params.get('family') || '';

    this.sub = this.todoService.hentState().subscribe(state => {
      this.state = state;
      this.chatSenderId ||= state.members[0]?.id || '';
      this.locationMemberId ||= state.members[0]?.id || '';
      this.familyNameDraft ||= state.familyName;
    });

    this.authSub = this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.authSub?.unsubscribe();
  }

  selectView(view: AppView) {
    this.activeView = view;
    this.showMobileMenu = false;
  }

  get members(): FamilyMember[] {
    return this.state?.members || [];
  }

  get todos(): TodoItem[] {
    return this.state?.todos || [];
  }

  get messages(): FamilyMessage[] {
    return this.state?.messages || [];
  }

  get invites(): FamilyInvite[] {
    return this.state?.invites || [];
  }

  get activeLabel(): string {
    return this.language.t(this.navItems.find(item => item.id === this.activeView)?.labelKey || 'dashboard');
  }

  get needsFamilySetup(): boolean {
    return Boolean(this.user && this.state && !this.state.isSetupComplete && !this.hasPendingInvite);
  }

  get hasPendingInvite(): boolean {
    return Boolean(this.pendingInviteCode && this.pendingInviteFamilyId);
  }

  get todayTasks(): TodoItem[] {
    const today = new Date().toDateString();
    return this.todos.filter(todo => todo.dueDateTime && new Date(todo.dueDateTime).toDateString() === today);
  }

  get openTasks(): TodoItem[] {
    return this.todos.filter(todo => !todo.completed);
  }

  get childTasks(): TodoItem[] {
    const childIds = this.members.filter(member => member.role === 'child').map(member => member.id);
    return this.todos.filter(todo => childIds.includes(todo.assigneeId));
  }

  get approvalQueue(): TodoItem[] {
    return this.todos.filter(todo => todo.requiresApproval && todo.completed && !todo.approvedById);
  }

  get upcomingReminders(): TodoItem[] {
    return this.todos
      .filter(todo => !todo.completed && todo.reminderMinutesBefore && todo.dueDateTime)
      .slice(0, 4);
  }

  memberFor(id: string): FamilyMember | undefined {
    return this.members.find(member => member.id === id);
  }

  sendMessage() {
    this.todoService.sendMessage(this.chatSenderId, this.chatText);
    this.chatText = '';
  }

  updateLocation() {
    this.todoService.updateMemberLocation(this.locationMemberId, this.locationLabel);
    this.locationLabel = '';
  }

  editMember(member: FamilyMember) {
    this.editingMemberId = member.id;
    this.profileDraft = { ...member };
  }

  cancelProfileEdit() {
    this.editingMemberId = null;
    this.profileDraft = null;
  }

  saveProfile() {
    if (!this.profileDraft) return;

    this.todoService.updateMemberProfile({
      ...this.profileDraft,
      role: this.profileDraft.role as FamilyRole
    });
    this.cancelProfileEdit();
  }

  async submitAuth() {
    this.authError = '';

    if (this.authMode === 'register' && this.authPassword !== this.authPasswordConfirm) {
      this.authError = 'Passordene er ikke like.';
      return;
    }

    try {
      if (this.authMode === 'login') {
        await this.authService.signIn(this.authEmail, this.authPassword);
      } else {
        await this.authService.register(this.authEmail, this.authPassword);
      }
      this.authPassword = '';
      this.authPasswordConfirm = '';
    } catch (error) {
      this.authError = this.authMessage(error);
    }
  }

  async logout() {
    await this.authService.logout();
  }

  setLanguage(language: AppLanguage) {
    this.language.setLanguage(language);
  }

  private authMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : '';

    if (message.includes('auth/configuration-not-found')) {
      return 'Firebase Authentication er ikke ferdig konfigurert. Aktiver Email/Password i Firebase Console.';
    }

    if (message.includes('auth/email-already-in-use')) {
      return 'Denne e-postadressen har allerede en konto. Velg "Jeg har konto fra før".';
    }

    if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password')) {
      return 'Feil e-post eller passord.';
    }

    if (message.includes('auth/weak-password')) {
      return 'Passordet må være minst 6 tegn.';
    }

    if (message.includes('auth/invalid-email')) {
      return 'Skriv inn en gyldig e-postadresse.';
    }

    return 'Kunne ikke fullføre innloggingen. Sjekk Firebase-oppsettet og prøv igjen.';
  }

  saveFamilyName() {
    this.todoService.updateFamilyName(this.familyNameDraft);
  }

  addMember() {
    this.todoService.addMember(this.newMemberName, this.newMemberRole, this.newMemberColor);
    this.newMemberName = '';
    this.newMemberRole = 'child';
    this.newMemberColor = '#007c89';
  }

  createFamily() {
    this.todoService.createFamily(this.setupFamilyName, this.setupAdultName);
    this.setupFamilyName = '';
    this.setupAdultName = '';
  }

  createInvite() {
    this.latestInvite = this.todoService.createInvite(this.inviteRole, this.inviteRecipient);
    this.inviteRecipient = '';
  }

  inviteLink(invite: FamilyInvite): string {
    const url = new URL(this.appBaseUrl());
    url.searchParams.set('family', invite.familyId);
    url.searchParams.set('invite', invite.code);
    return url.toString();
  }

  private appBaseUrl(): string {
    if (window.location.origin.startsWith('http')) {
      return window.location.origin;
    }

    return 'http://127.0.0.1:4200';
  }

  async acceptInvite() {
    this.inviteError = '';
    const error = await this.todoService.acceptInvite(
      this.pendingInviteFamilyId,
      this.pendingInviteCode,
      this.inviteDisplayName
    );

    if (error) {
      this.inviteError = error;
      return;
    }

    this.pendingInviteCode = '';
    this.pendingInviteFamilyId = '';
    this.inviteDisplayName = '';
    window.history.replaceState({}, '', window.location.origin);
  }

  emailInviteLink(invite: FamilyInvite): string {
    const subject = encodeURIComponent(`Invitasjon til ${this.state?.familyName || 'Tadoo'}`);
    const body = encodeURIComponent(`Du er invitert til familien i Tadoo.\n\nÅpne lenken:\n${this.inviteLink(invite)}\n\nKode: ${invite.code}`);
    return `mailto:${invite.recipient || ''}?subject=${subject}&body=${body}`;
  }

  smsInviteLink(invite: FamilyInvite): string {
    const body = encodeURIComponent(`Tadoo-invitasjon: ${this.inviteLink(invite)} Kode: ${invite.code}`);
    return `sms:?&body=${body}`;
  }

  qrCodeUrl(invite: FamilyInvite): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(this.inviteLink(invite))}`;
  }

  formatDateTime(value?: string): string {
    if (!value) return '';
    return new Intl.DateTimeFormat(this.language.locale, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }

  formatTime(value: string): string {
    return new Intl.DateTimeFormat(this.language.locale, {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }
}
