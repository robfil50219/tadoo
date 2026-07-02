# Tadoo

Family task management app built with Next.js, React, TypeScript, Zustand, SCSS, and Firebase.

## Getting Started

Prerequisites:

- Node.js 20+
- npm 10+

Install dependencies and run the app:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

```bash
npm run dev         # Start the local Next.js dev server
npm run build       # Build for production
npm start           # Run the production Next.js server
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript without emitting files
```

## Project Structure

```text
app/          Next.js app router entrypoints and global styles
components/   React components and view-level screens
lib/          Firebase config, hooks, and Zustand stores
public/       Static assets
```

## Demo Mode

The app works without Firebase environment variables. In that mode it uses the built-in demo user and stores family data in browser storage through Zustand persistence.

## Firebase Setup

Set these variables in `.env.local` to enable Firebase Authentication:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Firestore rules and storage rules are kept in `firestore.rules` and `storage.rules`. Firestore data sync is still a launch task; the current shared family state persists locally.

## Deployment

Netlify builds with `npm run build` and publishes `.next`.

Firebase Hosting is configured with framework detection from the project root. Deploy Firebase rules and hosting through the Firebase CLI after configuring the project.
