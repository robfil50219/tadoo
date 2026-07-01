'use client';

import { useCallback, useState } from 'react';

export type AppLanguage = 'en' | 'no' | 'sv' | 'da';

const translations: Record<AppLanguage, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    calendar: 'Calendar',
    family: 'Family',
    chat: 'Chat',
    location: 'Location',
    settings: 'Settings',
    'add-task': 'Add Task',
    'edit-task': 'Edit Task',
    'delete-task': 'Delete Task',
    'mark-complete': 'Mark Complete',
    'new-task': 'New task...',
  },
  no: {
    dashboard: 'Oversikt',
    tasks: 'Oppgaver',
    calendar: 'Kalender',
    family: 'Familie',
    chat: 'Chat',
    location: 'Lokasjon',
    settings: 'Innstillinger',
    'add-task': 'Legg til oppgave',
    'edit-task': 'Rediger oppgave',
    'delete-task': 'Slett oppgave',
    'mark-complete': 'Merk som fullført',
    'new-task': 'Ny oppgave...',
  },
  sv: {
    dashboard: 'Instrumentbräde',
    tasks: 'Uppgifter',
    calendar: 'Kalender',
    family: 'Familj',
    chat: 'Chatt',
    location: 'Plats',
    settings: 'Inställningar',
    'add-task': 'Lägg till uppgift',
    'edit-task': 'Redigera uppgift',
    'delete-task': 'Ta bort uppgift',
    'mark-complete': 'Markera som färdig',
    'new-task': 'Ny uppgift...',
  },
  da: {
    dashboard: 'Instrumentbræt',
    tasks: 'Opgaver',
    calendar: 'Kalender',
    family: 'Familie',
    chat: 'Chat',
    location: 'Placering',
    settings: 'Indstillinger',
    'add-task': 'Tilføj opgave',
    'edit-task': 'Rediger opgave',
    'delete-task': 'Slet opgave',
    'mark-complete': 'Markér som fuldført',
    'new-task': 'Ny opgave...',
  },
};

export function useLanguage() {
  const [language, setLanguage] = useState<AppLanguage>('no');

  const t = useCallback(
    (key: string): string => {
      return translations[language][key] || translations['en'][key] || key;
    },
    [language]
  );

  const locale = language === 'no' ? 'nb-NO' : language === 'sv' ? 'sv-SE' : language === 'da' ? 'da-DK' : 'en-US';

  return {
    language,
    setLanguage,
    t,
    locale,
  };
}
