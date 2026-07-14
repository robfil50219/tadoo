<p align="center">
  <img src="public/images/tadoologo2.png" alt="Tadoo logo" width="120" />
</p>

<h1 align="center">Tadoo</h1>

<p align="center">
  <strong>The family app that turns everyday responsibilities into teamwork.</strong><br/>
  Tasks · Calendar · Chat · Family · Location
</p>

<p align="center">
  <a href="https://tadoo.netlify.app"><strong>View Live Demo</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.4.0--alpha-blue" alt="Version 0.4.0 alpha" />
  <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-18-61dafb" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Firebase-11-orange" alt="Firebase 11" />
  <img src="https://img.shields.io/badge/PWA-enabled-purple" alt="PWA enabled" />
  <img src="https://img.shields.io/badge/license-Proprietary-red" alt="Proprietary license" />
</p>

---

## About Tadoo

Tadoo is a family coordination platform designed to help parents and children manage everyday responsibilities together.

The app brings tasks, calendars, family communication, member management and location sharing into one shared workspace. It is built with a focus on simplicity, accessibility, collaboration and a friendly experience for both adults and children.

Tadoo is currently being developed as a commercial product by **CodeForge Studio**.

### The problem

Families often coordinate everyday life across several disconnected tools:

- Messaging apps
- Personal calendars
- Notes and paper lists
- Task-management apps
- Location-sharing services

Tadoo brings these functions together in one family-focused application.

### Who is it for?

Tadoo is designed for families who want to:

- Share responsibilities fairly
- Give children clear and age-appropriate tasks
- Coordinate activities through one shared calendar
- Communicate without relying on several separate apps
- Encourage responsibility through approval flows, progress and rewards
- Keep important family information in one shared place

---

## Live Demo

The latest public version is available here:

### [Open Tadoo](https://tadoo.netlify.app)

Tadoo is currently in active alpha development. Some features, content and interfaces may change before launch.

---

## Core Features

| Feature | Description |
| :--- | :--- |
| 📋 **Task management** | Create, assign and track tasks with categories, priorities, due dates and approval flows |
| 📅 **Shared calendar** | Coordinate family activities through month and agenda views |
| 💬 **Family chat** | Real-time communication between family members |
| 👨‍👩‍👧‍👦 **Family management** | Create a family, invite members, manage profiles and control permissions |
| 📍 **Location sharing** | Share manual statuses or GPS-based locations through an interactive map |
| 🎨 **Member profiles** | Profile images, initials, display names and individual member colors |
| 🌙 **Light and dark themes** | Animated day and night themes with persistent user preferences |
| 🌍 **Four languages** | Norwegian, English, Swedish and Danish |
| 📱 **Responsive interface** | Designed for desktop, tablet and mobile devices |
| 📲 **Progressive Web App** | Installable app experience with manifest and service-worker support |
| 🎬 **Motion and feedback** | Reduced-motion-aware transitions and interface feedback |
| 🔐 **Role-based access** | Different permissions for adults, authenticated members and local child profiles |

---

## Technology Stack

| Area | Technology |
| :--- | :--- |
| Framework | Next.js 16 |
| UI | React 18 |
| Language | TypeScript 5 |
| State management | Zustand with persistence and selectors |
| Styling | SCSS with component-focused styles |
| Animation | Motion for React |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| File storage | Firebase Storage |
| Maps | Leaflet |
| Notifications | React Hot Toast |
| Hosting | Netlify |
| Alternative hosting | Firebase Hosting |
| Continuous integration | GitHub Actions |
| Security testing | Firebase Emulator Suite and Rules Unit Testing |

---

## Application Architecture

Tadoo uses a feature-based architecture.

Each primary product domain owns its components, hooks, services and TypeScript definitions. Shared application infrastructure is kept outside the feature directories.

```text
app/
├── layout.tsx
├── page.tsx
├── globals.scss
├── privacy/
└── terms/

components/
├── layout/
├── pwa/
└── shared/

features/
├── auth/
├── chat/
├── family/
├── settings/
└── tasks/

lib/
├── config/
├── hooks/
├── i18n/
├── store/
├── animations.ts
└── memberColors.ts

public/
├── icons/
├── images/
└── manifest.json

tests/
├── firestore.membership.rules.test.mjs
└── storage.rules.test.mjs
```

### Feature boundaries

Each feature exposes its public API through an `index.ts` entrypoint.

Code outside a feature should import from the feature entrypoint rather than reaching into internal directories.

ESLint import rules are used to help prevent circular dependencies and maintain clear boundaries between application domains.

---

## Security

Tadoo uses Firebase Security Rules to protect family data and uploaded files.

Security considerations include:

- Family membership validation
- Role-based access control
- Protection against cross-family data access
- Restricted profile editing
- Controlled avatar upload paths
- Validation of file types and file sizes
- Separate handling of authenticated and local profiles
- Storage object cleanup when images or profiles are removed

Firestore and Storage rules are stored in:

```text
firestore.rules
storage.rules
```

Firebase Emulator Suite tests verify important membership and storage permissions locally.

---

## Accessibility

Accessibility is considered throughout the interface.

Current accessibility work includes:

- Semantic controls and labels
- Keyboard-accessible interactions
- Modal semantics
- Escape-key dismissal
- Alternative text for profile images
- Visible loading, success and error feedback
- Support for reduced-motion preferences
- Responsive layouts for smaller screens

A complete WCAG review is planned before production launch.

---

## Internationalization

Tadoo currently supports four languages:

- 🇳🇴 Norwegian Bokmål
- 🇬🇧 English
- 🇸🇪 Swedish
- 🇩🇰 Danish

Norwegian is the default language.

Translations are stored in:

```text
lib/i18n/translations.ts
```

The selected language is persisted and shared across the authentication experience and the main application.

---

## Demo Mode

Tadoo can run without Firebase configuration.

When Firebase environment variables are unavailable, the application can use a built-in demo user and locally persisted family data.

Demo mode makes it possible to:

- Explore the interface without creating a Firebase project
- Review the application locally
- Test the main navigation and workflows
- Demonstrate the product without using production family data

Demo data is stored locally in the browser through Zustand persistence.

---

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer

### Clone the repository

```bash
git clone https://github.com/robertfilep/tadoo.git
cd tadoo
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Without Firebase environment variables, the application will start in demo mode.

---

## Firebase Configuration

To enable Firebase authentication, synchronization and storage, create a Firebase project and add a `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Do not commit `.env.local` or production credentials to the repository.

---

## Available Scripts

```bash
npm run dev                  # Start the Next.js development server
npm run build                # Create an optimized production build
npm start                    # Run the production build locally
npm run lint                 # Run ESLint
npm run type-check           # Run TypeScript checks
npm run test:firestore-rules # Test Firestore security rules
npm run test:storage-rules   # Test Firebase Storage security rules
```

---

## Testing

Tadoo currently includes automated tests for critical Firebase security rules.

### Existing automated coverage

- Firestore family membership rules
- Cross-family access protection
- Storage avatar access
- Authenticated member avatar paths
- Local child profile avatar paths
- Deleted and inaccessible storage objects

### Planned test expansion

- Unit tests for utilities and state logic
- Component tests
- Authentication-flow tests
- Family-management integration tests
- Task workflow tests
- End-to-end tests for critical user journeys
- Accessibility testing
- Cross-browser testing

---

## Deployment

### Netlify

The primary deployment is hosted on Netlify.

Netlify automatically builds the application from the `master` branch using:

```bash
npm run build
```

### Firebase deployment

Deploy Firestore and Storage rules with:

```bash
firebase deploy --only firestore:rules,storage
```

Deploy Firebase Hosting with:

```bash
firebase deploy --only hosting
```

---

## Development Status

Tadoo is currently in **alpha development**.

Current version:

```text
0.4.0-alpha
```

The application is functional but is not yet considered production-ready.

### Available today

- Email and password authentication
- Family creation and invitation codes
- Adult and child profile management
- Profile image upload, replacement and removal
- Role-based profile permissions
- Task creation and assignment
- Task categories and priorities
- Task approval workflows
- Shared calendar
- Family chat
- Manual and GPS-based location sharing
- Light and dark modes
- Norwegian, English, Swedish and Danish
- Responsive layouts
- Demo mode
- Progressive Web App configuration
- Firestore Security Rules tests
- Storage Security Rules tests
- CI checks for linting, type checking and production builds

### Planned before production launch

- Firestore subcollection migration
- Push notifications
- Email verification
- Password-reset flow
- Google authentication
- Sign in with Apple
- Complete account deletion flow
- Expanded automated test coverage
- Error monitoring and reporting
- Complete WCAG accessibility review
- Performance optimization
- Production analytics
- App-store packaging and launch preparation

See [`LAUNCH_PLAN.md`](LAUNCH_PLAN.md) for the broader launch roadmap.

---

## Key Engineering Decisions

### Feature-based organization

Code is grouped by product domain instead of file type. This makes the project easier to maintain as features grow.

### Zustand for local application state

Zustand manages fast client-side state and supports persisted demo-mode data.

### Firestore for synchronized family data

Cloud Firestore provides real-time synchronization between authenticated family members.

### Separate local and authenticated profiles

Local child profiles allow younger family members to participate without requiring separate Firebase accounts.

### Firebase Security Rules as part of the application

Authorization is enforced at the database and storage layers, not only through the user interface.

### Motion with reduced-motion support

Interface animation is used to improve feedback without ignoring user accessibility preferences.

### Fixed avatar storage paths

Avatar replacements overwrite the previous object instead of continuously creating unused files.

---

## Repository Purpose

This repository is public to:

- Demonstrate the development of Tadoo
- Document technical decisions
- Present the project as part of Robert Filep’s professional portfolio
- Show the progression of a commercial application from concept toward launch

The repository is not an open-source project.

---

## License

**Proprietary — All rights reserved by CodeForge Studio.**

This repository is publicly visible for portfolio, transparency and demonstration purposes only.

The source code may not be copied, modified, reused, redistributed, sublicensed or used commercially without written permission from CodeForge Studio.

Copyright © 2026 CodeForge Studio.

---

## Author

**Robert Filep**  
Founder and Frontend Developer  
**CodeForge Studio**

Email: [robert@codeforgestudio.no](mailto:robert@codeforgestudio.no)

GitHub: [github.com/robertfilep](https://github.com/robertfilep)

---

<p align="center">
  Built by CodeForge Studio in Trondheim, Norway.
</p>

