<p align="center">
  <img src="public/images/tadoologo2.png" alt="Tadoo logo" width="120" />
</p>

<h1 align="center">Tadoo</h1>

<p align="center">
  <strong>Familieappen som gjør husarbeid til et lagspill.</strong><br/>
  Oppgaver · Kalender · Chat · Lokasjon — alt på ett sted.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/versjon-0.4.0--alpha-blue" alt="Version" />
  <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-61dafb" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Firebase-11-orange" alt="Firebase" />
  <img src="https://img.shields.io/badge/lisens-Proprietary-red" alt="License" />
</p>

---

## Hva er Tadoo?

Tadoo er en familieorganisator som hjelper foreldre og barn med å dele oppgaver, koordinere kalendere, og kommunisere — alt på ett sted. Bygget med fokus på enkelhet, glede, og samarbeid.

**For hvem?** Familier med barn som ønsker å:
- Fordele husarbeid rettferdig med tydelig eierskap
- Ha én felles kalender for hele familien
- Kommunisere om oppgaver uten å drukne i meldingsapper
- Gi barn ansvar gjennom gamification og belønninger

---

## Funksjoner

| Funksjon | Beskrivelse |
| :--- | :--- |
| 📋 **Oppgaver** | Opprett, tildel, og følg opp oppgaver med kategorier, prioritet, og godkjenningsflyt |
| 📅 **Kalender** | Delt familiekalender med månedsvisning og agenda |
| 💬 **Chat** | Sanntids familiechat knyttet til oppgaver |
| 📍 **Lokasjon** | Manuell statusdeling og kartvisning med Leaflet |
| 👨‍👩‍👧‍👦 **Familie** | Opprett familie, inviter medlemmer med kode, administrer roller |
| 🌙 **Dag/natt-modus** | Animert tema med CSS og canvas-bakgrunn |
| 🌍 **4 språk** | Norsk, English, Svenska, Dansk |
| 🎬 **Animasjoner** | Subtile micro-interactions med Framer Motion |

---

## Teknologi

| Lag | Teknologi |
| :--- | :--- |
| Frontend | Next.js 16, React 18, TypeScript 5 |
| State | Zustand med persist og subscribeWithSelector |
| Styling | SCSS (komponent-scoped) |
| Animasjon | Framer Motion (motion) |
| Backend | Firebase Auth, Firestore, Storage |
| Kart | Leaflet |
| Deployment | Netlify |

---

## Kom i gang

### Forutsetninger

- Node.js 20+
- npm 10+

### Installasjon

```bash
git clone https://github.com/robfil50219/tadoo.git
cd tadoo
npm install
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000).

### Demo-modus

Appen fungerer **uten Firebase-konfigurasjon**. I demo-modus brukes en innebygd bruker og all familiedata lagres lokalt i nettleseren via Zustand persistence. Perfekt for å utforske appen uten oppsett.

---

## Firebase-oppsett

For å aktivere autentisering og sanntidssynkronisering, opprett en Firebase-prosjekt og legg til følgende i `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=din_nøkkel
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ditt_prosjekt.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ditt_prosjekt
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ditt_prosjekt.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=din_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=din_app_id
```

Firestore-regler og Storage-regler finnes i `firestore.rules` og `storage.rules`.

---

## Scripts

```bash
npm run dev         # Start lokal utviklingsserver
npm run build       # Bygg for produksjon
npm start           # Kjør produksjonsserver
npm run lint        # Kjør ESLint
npm run type-check  # TypeScript-sjekk uten å bygge
```

---

## Prosjektstruktur

```text
app/
├── layout.tsx              Rot-layout med metadata og font
├── page.tsx                App-shell (auth-gating, navigasjon, views)
├── globals.scss            Globale stiler og CSS-variabler
├── privacy/                Personvernside
└── terms/                  Vilkårside

components/
├── AuthModal.tsx           Innlogging og registrering
├── AuthSceneCanvas.tsx     Animert canvas-bakgrunn for auth
├── FamilySetup.tsx         Opprett eller bli med i familie
├── LanguageSwitcher.tsx    Språkvelger-komponent
├── Navigation.tsx          Sidebar-navigasjon med responsivt design
└── views/
    ├── Dashboard.tsx       Oversikt med dagens oppgaver og familiemedlemmer
    ├── TasksList.tsx       Oppgaveliste med CRUD og filtrering
    ├── Calendar.tsx        Månedskalender med agenda-panel
    ├── Chat.tsx            Sanntids familiechat
    ├── Family.tsx          Familiemedlemmer og invitasjoner
    ├── Location.tsx        Kartvisning og GPS-deling
    └── Settings.tsx        Konto, tema, språk, og personvern

lib/
├── config/firebase.ts      Firebase-konfigurasjon og feature-flag
├── hooks/
│   ├── useAuth.ts          Autentisering (login, register, logout)
│   ├── useFamilySync.ts    Firestore-synkronisering
│   ├── useLanguage.ts      i18n-hook med t()-funksjon
│   └── useThemeMode.ts     Dag/natt-modus
├── i18n/translations.ts    Alle oversettelser (no, en, sv, da)
├── services/
│   └── familyFirestore.ts  Firestore CRUD og sanntidslytting
├── store/
│   └── todoStore.ts        Zustand store (familie, oppgaver, chat, lokasjon)
├── animations.ts           Framer Motion-varianter
└── memberColors.ts         Fargekart for familiemedlemmer
```

---

## Språk

Tadoo støtter fire språk med norsk som standard:

- 🇳🇴 Norsk (bokmål)
- 🇬🇧 English
- 🇸🇪 Svenska
- 🇩🇰 Dansk

Alle oversettelser ligger i `lib/i18n/translations.ts`. Språk kan byttes når som helst via innstillinger eller språkvelgeren.

---

## Deployment

**Primær:** Netlify — automatisk bygg fra `main`-branch med `npm run build`.

Firebase Hosting er konfigurert som alternativ for full Firebase-integrasjon. Deploy regler og hosting via Firebase CLI:

```bash
firebase deploy --only firestore:rules,storage
firebase deploy --only hosting
```

---

## Status

Tadoo er i **alpha** (v0.4.0). Appen er funksjonell men ikke produksjonsklar.

### ✅ Fungerer i dag
- E-post/passord-autentisering
- Opprett og bli med i familie via invitasjonskode
- Oppgaver med kategorier, prioritet, tildeling, og godkjenning
- Delt kalender med månedsvisning
- Familiechat i sanntid
- Lokasjonsdeling (manuell + GPS)
- Dag/natt-modus
- 4 språk
- Demo-modus uten Firebase

### 🚧 Planlagt før lansering
- Migrering til Firestore subcollections (skalerbarhet)
- Push-varsler
- E-postverifisering og passordgjenoppretting
- Sign in with Apple / Google
- Fullstendig kontosletting
- Automatiserte tester
- Feilmonitorering (Sentry)
- Tilgjengelighetsgjennomgang (WCAG)
- PWA-støtte

Se `LAUNCH_PLAN.md` for fullstendig lanseringsplan.

---

## Lisens

Proprietary — Alle rettigheter forbeholdt CodeForge Studio.

---

## Kontakt

**Robert** — Grunnlegger, CodeForge Studio
📧 robert@codeforgestudio.no
