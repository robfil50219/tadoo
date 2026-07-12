<p align="center">
  <img src="public/images/tadoologo2.png" alt="Tadoo logo" width="120" />
</p>

<h1 align="center">Tadoo</h1>

<p align="center">
  <strong>The family app that turns chores into teamwork.</strong><br/>
  Tasks · Calendar · Chat · Location — all in one place.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.4.0--alpha-blue" alt="Version" />
  <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-61dafb" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Firebase-11-orange" alt="Firebase" />
  <img src="https://img.shields.io/badge/license-Proprietary-red" alt="License" />
</p>

---

## What is Tadoo?

Tadoo is a family organizer that helps parents and kids share tasks, coordinate calendars, and communicate — all in one place. Built with a focus on simplicity, joy, and collaboration.

**Who is it for?** Families with children who want to:
- Distribute chores fairly with clear ownership
- Have one shared calendar for the whole family
- Communicate about tasks without drowning in messaging apps
- Give kids responsibility through gamification and rewards

---

## Features

| Feature | Description |
| :--- | :--- |
| 📋 **Tasks** | Create, assign, and track tasks with categories, priority, and approval flow |
| 📅 **Calendar** | Shared family calendar with month view and agenda |
| 💬 **Chat** | Real-time family chat linked to tasks |
| 📍 **Location** | Manual status sharing and map view with Leaflet |
| 👨‍👩‍👧‍👦 **Family** | Create family, invite members with code, manage roles |
| 🌙 **Dark/light mode** | Animated theme with CSS and canvas background |
| 🌍 **4 languages** | Norwegian, English, Swedish, Danish |
| 🎬 **Animations** | Subtle micro-interactions with Framer Motion |

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | Next.js 16, React 18, TypeScript 5 |
| State | Zustand with persist and subscribeWithSelector |
| Styling | SCSS (component-scoped) |
| Animation | Framer Motion (motion) |
| Backend | Firebase Auth, Firestore, Storage |
| Maps | Leaflet |
| Deployment | Netlify |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
git clone https://github.com/robfil50219/tadoo.git
cd tadoo
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Mode

The app works **without Firebase configuration**. In demo mode, a built-in user is used and all family data is stored locally in the browser via Zustand persistence. Perfect for exploring the app without any setup.

---

## Firebase Setup

To enable authentication and real-time synchronization, create a Firebase project and add the following to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Firestore rules and Storage rules are located in `firestore.rules` and `storage.rules`.

---

## Scripts

```bash
npm run dev         # Start local development server
npm run build       # Build for production
npm start           # Run production server
npm run lint        # Run ESLint
npm run type-check  # TypeScript check without building
```

---

## Project Structure

```text
app/
├── layout.tsx              Root layout with metadata and font
├── page.tsx                App shell (auth-gating, navigation, views)
├── globals.scss            Global styles and CSS variables
├── privacy/                Privacy policy page
└── terms/                  Terms of service page

components/
├── layout/                 Application shell components such as Navigation
└── shared/                 Reusable components such as LanguageSwitcher

features/
├── auth/                   Authentication components, hooks, and types
├── chat/                   Family chat components, hooks, and types
├── family/                 Setup, members, location, sync, and services
├── settings/               Account, appearance, and privacy settings
└── tasks/                  Task list, calendar, dashboard, hooks, and types

lib/
├── config/firebase.ts      Firebase configuration and feature flag
├── hooks/
│   ├── useLanguage.ts      i18n hook with t() function
│   └── useThemeMode.ts     Dark/light mode
├── i18n/translations.ts    All translations (no, en, sv, da)
├── store/
│   └── todoStore.ts        Zustand store (family, tasks, chat, location)
├── animations.ts           Framer Motion variants
└── memberColors.ts         Color map for family members
```

Each feature owns its components, hooks, and domain types. Feature `index.ts` files
are public entrypoints; code outside a feature should prefer those barrel exports
over internal paths. ESLint's `import/no-cycle` rule guards these boundaries against
circular dependencies.

---

## Languages

Tadoo supports four languages with Norwegian as the default:

- 🇳🇴 Norwegian (Bokmål)
- 🇬🇧 English
- 🇸🇪 Swedish
- 🇩🇰 Danish

All translations are located in `lib/i18n/translations.ts`. Language can be switched at any time via settings or the language selector.

---

## Deployment

**Primary:** Netlify — automatic build from `main` branch with `npm run build`.

Firebase Hosting is configured as an alternative for full Firebase integration. Deploy rules and hosting via Firebase CLI:

```bash
firebase deploy --only firestore:rules,storage
firebase deploy --only hosting
```

---

## Status

Tadoo is in **alpha** (v0.4.0). The app is functional but not production-ready.

### ✅ Working Today
- Email/password authentication
- Create and join family via invite code
- Tasks with categories, priority, assignment, and approval
- Shared calendar with month view
- Family chat in real-time
- Location sharing (manual + GPS)
- Dark/light mode
- 4 languages
- Demo mode without Firebase

### 🚧 Planned Before Launch
- Migration to Firestore subcollections (scalability)
- Push notifications
- Email verification and password recovery
- Sign in with Apple / Google
- Full account deletion
- Automated tests
- Error monitoring (Sentry)
- Accessibility review (WCAG)
- PWA support

See `LAUNCH_PLAN.md` for the full launch plan.

---

## License

Proprietary — All rights reserved by CodeForge Studio.

This repository is public for transparency and portfolio purposes only.

The source code may not be copied, reused, modified, distributed, or used commercially without written permission from CodeForge Studio.

Copyright © 2026 CodeForge Studio.

---

## Contact

**Robert Filep** — CodeForge Studio 
📧 robert@codeforgestudio.no
