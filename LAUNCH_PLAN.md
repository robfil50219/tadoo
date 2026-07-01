# Tadoo Launch Plan

This is the practical path from the current prototype to a launchable family app.

## Current State

- Angular frontend with dashboard, tasks, calendar, family profiles, chat, and location prototype.
- Local demo mode works without Firebase configuration.
- Firebase-ready Auth and Firestore wiring has been added.
- Firebase Hosting, Firestore rules, Storage rules, and deploy script are scaffolded.

## Firebase Setup

1. Create a Firebase project.
2. Enable Authentication with Email/Password.
3. Create a Firestore database.
4. Enable Firebase Storage.
5. Copy the web app config into `src/app/config/firebase.ts`.
6. Run `npm run build:prod`.
7. Deploy with `npm run deploy:firebase`.

## Before Public Launch

- Replace the temporary `demo-family` cloud document with real family creation.
- Store family data in subcollections:
  - `families/{familyId}/tasks`
  - `families/{familyId}/messages`
  - `families/{familyId}/locations`
  - `families/{familyId}/invites`
- Add invitation links for joining a family.
- Add account deletion and data export.
- Add privacy policy and terms.
- Add explicit consent screens for location sharing, especially for children.
- Add push notifications through Firebase Cloud Messaging and Cloud Functions.
- Add production monitoring and error logging.
- Add password reset and email verification flows.
- Add role-based permissions for adults, children, and invited users.
- Add invite expiry, revoke, and resend handling.
- Add onboarding states for empty families, first task, first calendar item, and first invite.
- Add loading, offline, and failed-sync states for every Firebase-backed view.
- Add duplicate-account and duplicate-family safeguards.
- Add audit fields for important changes, including who created, completed, approved, or deleted a task.
- Add automated tests for auth, invitations, Firestore rules, task CRUD, and family membership changes.
- Add accessibility pass for keyboard navigation, focus states, labels, contrast, and screen-reader text.
- Add responsive QA for phone, tablet, desktop, and iPad Safari.
- Add production build checks for bundle size, source maps, environment config, and cache behavior.
- Add backup and recovery plan for Firestore data.
- Add support/contact path for users who are locked out or need help deleting data.
- Add app icons, social preview image, favicon, and install metadata for PWA/mobile home screen.
- Add analytics events for core flows without tracking sensitive family content.
- Add release checklist for Firebase deploy, rules deploy, smoke test, rollback, and post-launch monitoring.

## Legal And Safety Requirements

- Parents must control child profiles.
- Location sharing must be opt-in and easy to disable.
- Users must be able to delete their account and family data.
- Chat and location data must never be public.
- Firestore rules must be tested before launch.

## Recommended Beta Scope

- Email/password login
- One family per account
- Invite family members
- Shared tasks
- Shared calendar
- Family chat
- Manual location status

Real GPS tracking and push notifications should come after the beta data model is stable.
