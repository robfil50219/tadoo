import '../legal.scss';

export default function TermsPage() {
  return (
    <main className="legal-page">
      <article className="legal-shell">
        <a href="/">Back to Tadoo</a>
        <p className="legal-kicker">Tadoo family app</p>
        <h1>Terms of Service</h1>
        <p>
          Tadoo helps families coordinate tasks, calendars, messages, and household routines. By
          using Tadoo, families agree to use the app in a safe, respectful, and lawful way.
        </p>

        <h2>Family use</h2>
        <p>
          Parents and guardians are responsible for managing family members, child access, shared
          tasks, calendar details, messages, and location features.
        </p>

        <h2>Account responsibility</h2>
        <p>
          Users should keep login details private and only invite trusted family members or caregivers
          into their family space.
        </p>

        <h2>Service changes</h2>
        <p>
          Tadoo may update features over time to improve safety, reliability, and the family
          experience.
        </p>

        <h2>Support</h2>
        <p>
          For terms questions or account deletion support, contact the Tadoo support contact listed
          with the App Store submission.
        </p>
      </article>
    </main>
  );
}
