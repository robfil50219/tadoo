import { Injectable } from '@angular/core';

export type AppLanguage = 'no' | 'sv' | 'da' | 'fi' | 'en';

type TranslationKey =
  | 'appName'
  | 'welcome'
  | 'login'
  | 'register'
  | 'email'
  | 'password'
  | 'confirmPassword'
  | 'createAccount'
  | 'existingAccount'
  | 'logout'
  | 'demo'
  | 'dashboard'
  | 'tasks'
  | 'calendar'
  | 'family'
  | 'chat'
  | 'location'
  | 'settings'
  | 'today'
  | 'childTasks'
  | 'approval'
  | 'messages'
  | 'openTasks'
  | 'nextReminders'
  | 'latestMessages'
  | 'familyCalendar'
  | 'calendarDescription'
  | 'familySettings'
  | 'addFamilyMember'
  | 'sendInvite'
  | 'launchStatus'
  | 'language'
  | 'builtBy'
  | 'todo'
  | 'active'
  | 'newTask'
  | 'assignee'
  | 'category'
  | 'priority'
  | 'due'
  | 'requireApproval'
  | 'remind'
  | 'add'
  | 'delete'
  | 'approve'
  | 'approved'
  | 'needsApproval'
  | 'noDue'
  | 'home'
  | 'school'
  | 'activity'
  | 'health'
  | 'shopping'
  | 'low'
  | 'normal'
  | 'high';

type Dictionary = Record<TranslationKey, string>;

const translations: Record<AppLanguage, Dictionary> = {
  no: {
    appName: 'Tadoo familieapp',
    welcome: 'Velkommen til Tadoo',
    login: 'Logg inn',
    register: 'Opprett konto',
    email: 'E-post',
    password: 'Passord',
    confirmPassword: 'Gjenta passord',
    createAccount: 'Opprett ny konto',
    existingAccount: 'Jeg har konto fra før',
    logout: 'Logg ut',
    demo: 'Demo',
    dashboard: 'Oversikt',
    tasks: 'Oppgaver',
    calendar: 'Kalender',
    family: 'Familie',
    chat: 'Chat',
    location: 'Lokasjon',
    settings: 'Innstillinger',
    today: 'I dag',
    childTasks: 'Barneoppgaver',
    approval: 'Til godkjenning',
    messages: 'Meldinger',
    openTasks: 'åpne oppgaver',
    nextReminders: 'Neste påminnelser',
    latestMessages: 'Siste meldinger',
    familyCalendar: 'Familiekalender',
    calendarDescription: 'Oppgaver med frist vises automatisk i kalenderen.',
    familySettings: 'Familieinnstillinger',
    addFamilyMember: 'Legg til familiemedlem',
    sendInvite: 'Send invitasjon',
    launchStatus: 'Lanseringsstatus',
    language: 'Språk',
    builtBy: 'Bygget av Robert Filep',
    todo: 'To-do',
    active: 'aktive',
    newTask: 'Ny oppgave ...',
    assignee: 'Til',
    category: 'Kategori',
    priority: 'Prioritet',
    due: 'Frist',
    requireApproval: 'Krev voksen-godkjenning',
    remind: 'Påminn',
    add: 'Legg til',
    delete: 'Slett',
    approve: 'Godkjenn',
    approved: 'Godkjent',
    needsApproval: 'Mangler godkjenning',
    noDue: 'Ingen frist',
    home: 'Hjem',
    school: 'Skole',
    activity: 'Aktivitet',
    health: 'Helse',
    shopping: 'Handling',
    low: 'Lav',
    normal: 'Normal',
    high: 'Haster'
  },
  sv: {
    appName: 'Tadoo familjeapp',
    welcome: 'Välkommen till Tadoo',
    login: 'Logga in',
    register: 'Skapa konto',
    email: 'E-post',
    password: 'Lösenord',
    confirmPassword: 'Upprepa lösenord',
    createAccount: 'Skapa nytt konto',
    existingAccount: 'Jag har redan konto',
    logout: 'Logga ut',
    demo: 'Demo',
    dashboard: 'Översikt',
    tasks: 'Uppgifter',
    calendar: 'Kalender',
    family: 'Familj',
    chat: 'Chatt',
    location: 'Plats',
    settings: 'Inställningar',
    today: 'I dag',
    childTasks: 'Barnuppgifter',
    approval: 'För godkännande',
    messages: 'Meddelanden',
    openTasks: 'öppna uppgifter',
    nextReminders: 'Nästa påminnelser',
    latestMessages: 'Senaste meddelanden',
    familyCalendar: 'Familjekalender',
    calendarDescription: 'Uppgifter med deadline visas automatiskt i kalendern.',
    familySettings: 'Familjeinställningar',
    addFamilyMember: 'Lägg till familjemedlem',
    sendInvite: 'Skicka inbjudan',
    launchStatus: 'Lanseringsstatus',
    language: 'Språk',
    builtBy: 'Byggt av Robert Filep',
    todo: 'Att göra',
    active: 'aktiva',
    newTask: 'Ny uppgift ...',
    assignee: 'Till',
    category: 'Kategori',
    priority: 'Prioritet',
    due: 'Deadline',
    requireApproval: 'Kräv vuxengodkännande',
    remind: 'Påminn',
    add: 'Lägg till',
    delete: 'Ta bort',
    approve: 'Godkänn',
    approved: 'Godkänd',
    needsApproval: 'Saknar godkännande',
    noDue: 'Ingen deadline',
    home: 'Hem',
    school: 'Skola',
    activity: 'Aktivitet',
    health: 'Hälsa',
    shopping: 'Handling',
    low: 'Låg',
    normal: 'Normal',
    high: 'Bråttom'
  },
  da: {
    appName: 'Tadoo familieapp',
    welcome: 'Velkommen til Tadoo',
    login: 'Log ind',
    register: 'Opret konto',
    email: 'E-mail',
    password: 'Adgangskode',
    confirmPassword: 'Gentag adgangskode',
    createAccount: 'Opret ny konto',
    existingAccount: 'Jeg har allerede en konto',
    logout: 'Log ud',
    demo: 'Demo',
    dashboard: 'Overblik',
    tasks: 'Opgaver',
    calendar: 'Kalender',
    family: 'Familie',
    chat: 'Chat',
    location: 'Lokation',
    settings: 'Indstillinger',
    today: 'I dag',
    childTasks: 'Børneopgaver',
    approval: 'Til godkendelse',
    messages: 'Beskeder',
    openTasks: 'åbne opgaver',
    nextReminders: 'Næste påmindelser',
    latestMessages: 'Seneste beskeder',
    familyCalendar: 'Familiekalender',
    calendarDescription: 'Opgaver med deadline vises automatisk i kalenderen.',
    familySettings: 'Familieindstillinger',
    addFamilyMember: 'Tilføj familiemedlem',
    sendInvite: 'Send invitation',
    launchStatus: 'Lanceringsstatus',
    language: 'Sprog',
    builtBy: 'Bygget af Robert Filep',
    todo: 'To-do',
    active: 'aktive',
    newTask: 'Ny opgave ...',
    assignee: 'Til',
    category: 'Kategori',
    priority: 'Prioritet',
    due: 'Deadline',
    requireApproval: 'Kræv voksen-godkendelse',
    remind: 'Påmind',
    add: 'Tilføj',
    delete: 'Slet',
    approve: 'Godkend',
    approved: 'Godkendt',
    needsApproval: 'Mangler godkendelse',
    noDue: 'Ingen deadline',
    home: 'Hjem',
    school: 'Skole',
    activity: 'Aktivitet',
    health: 'Sundhed',
    shopping: 'Indkøb',
    low: 'Lav',
    normal: 'Normal',
    high: 'Haster'
  },
  fi: {
    appName: 'Tadoo perhesovellus',
    welcome: 'Tervetuloa Tadoohon',
    login: 'Kirjaudu sisään',
    register: 'Luo tili',
    email: 'Sähköposti',
    password: 'Salasana',
    confirmPassword: 'Toista salasana',
    createAccount: 'Luo uusi tili',
    existingAccount: 'Minulla on jo tili',
    logout: 'Kirjaudu ulos',
    demo: 'Demo',
    dashboard: 'Yleiskuva',
    tasks: 'Tehtävät',
    calendar: 'Kalenteri',
    family: 'Perhe',
    chat: 'Chat',
    location: 'Sijainti',
    settings: 'Asetukset',
    today: 'Tänään',
    childTasks: 'Lasten tehtävät',
    approval: 'Hyväksyttävät',
    messages: 'Viestit',
    openTasks: 'avointa tehtävää',
    nextReminders: 'Seuraavat muistutukset',
    latestMessages: 'Viimeisimmät viestit',
    familyCalendar: 'Perhekalenteri',
    calendarDescription: 'Määräpäivälliset tehtävät näkyvät automaattisesti kalenterissa.',
    familySettings: 'Perheasetukset',
    addFamilyMember: 'Lisää perheenjäsen',
    sendInvite: 'Lähetä kutsu',
    launchStatus: 'Julkaisun tila',
    language: 'Kieli',
    builtBy: 'Rakentanut Robert Filep',
    todo: 'Tehtävät',
    active: 'aktiivista',
    newTask: 'Uusi tehtävä ...',
    assignee: 'Kenelle',
    category: 'Kategoria',
    priority: 'Prioriteetti',
    due: 'Määräaika',
    requireApproval: 'Vaadi aikuisen hyväksyntä',
    remind: 'Muistuta',
    add: 'Lisää',
    delete: 'Poista',
    approve: 'Hyväksy',
    approved: 'Hyväksytty',
    needsApproval: 'Odottaa hyväksyntää',
    noDue: 'Ei määräaikaa',
    home: 'Koti',
    school: 'Koulu',
    activity: 'Aktiviteetti',
    health: 'Terveys',
    shopping: 'Ostokset',
    low: 'Matala',
    normal: 'Normaali',
    high: 'Kiireellinen'
  },
  en: {
    appName: 'Tadoo family app',
    welcome: 'Welcome to Tadoo',
    login: 'Log in',
    register: 'Create account',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
    createAccount: 'Create new account',
    existingAccount: 'I already have an account',
    logout: 'Log out',
    demo: 'Demo',
    dashboard: 'Overview',
    tasks: 'Tasks',
    calendar: 'Calendar',
    family: 'Family',
    chat: 'Chat',
    location: 'Location',
    settings: 'Settings',
    today: 'Today',
    childTasks: 'Child tasks',
    approval: 'For approval',
    messages: 'Messages',
    openTasks: 'open tasks',
    nextReminders: 'Next reminders',
    latestMessages: 'Latest messages',
    familyCalendar: 'Family calendar',
    calendarDescription: 'Tasks with due dates appear automatically in the calendar.',
    familySettings: 'Family settings',
    addFamilyMember: 'Add family member',
    sendInvite: 'Send invitation',
    launchStatus: 'Launch status',
    language: 'Language',
    builtBy: 'Built by Robert Filep',
    todo: 'To-do',
    active: 'active',
    newTask: 'New task ...',
    assignee: 'For',
    category: 'Category',
    priority: 'Priority',
    due: 'Due',
    requireApproval: 'Require adult approval',
    remind: 'Remind',
    add: 'Add',
    delete: 'Delete',
    approve: 'Approve',
    approved: 'Approved',
    needsApproval: 'Needs approval',
    noDue: 'No due date',
    home: 'Home',
    school: 'School',
    activity: 'Activity',
    health: 'Health',
    shopping: 'Shopping',
    low: 'Low',
    normal: 'Normal',
    high: 'Urgent'
  }
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly languages: { code: AppLanguage; label: string; flag: string; short: string }[] = [
    { code: 'no', label: 'Norsk', flag: '🇳🇴', short: 'NO' },
    { code: 'sv', label: 'Svenska', flag: '🇸🇪', short: 'SV' },
    { code: 'da', label: 'Dansk', flag: '🇩🇰', short: 'DA' },
    { code: 'fi', label: 'Suomi', flag: '🇫🇮', short: 'FI' },
    { code: 'en', label: 'English', flag: '🇬🇧', short: 'EN' }
  ];

  current: AppLanguage = this.readSavedLanguage();

  get locale(): string {
    return {
      no: 'nb-NO',
      sv: 'sv-SE',
      da: 'da-DK',
      fi: 'fi-FI',
      en: 'en-US'
    }[this.current];
  }

  setLanguage(language: AppLanguage) {
    this.current = language;
    localStorage.setItem('tadoo-language', language);
  }

  t(key: TranslationKey): string {
    return translations[this.current][key] || translations.no[key];
  }

  private readSavedLanguage(): AppLanguage {
    const saved = localStorage.getItem('tadoo-language') as AppLanguage | null;
    return saved && saved in translations ? saved : 'no';
  }
}
