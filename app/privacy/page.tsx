import '../legal.scss';

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <article className="legal-shell">
        <a href="/">Back to Tadoo</a>
        <p className="legal-kicker">Tadoo family app</p>
        <h1>Privacy Policy</h1>
        <p>
          Tadoo is designed for families. We keep the experience simple and only use family
          information to provide app features such as tasks, calendars, messages, and account access.
        </p>

        <h2>Information we use</h2>
        <p>
          Tadoo may store account details, family setup information, tasks, calendar items, messages,
          and location information when a family chooses to use those features.
        </p>

        <h2>How information is used</h2>
        <p>
          Information is used to sync the family app across signed-in members, keep parents informed,
          and make household planning easier. We do not sell family data.
        </p>

        <h2>Parent control</h2>
        <p>
          Parents can manage family access from the app settings and can request account or data
          deletion through the visible Delete account option.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy questions or deletion requests, contact the Tadoo support contact listed with
          the App Store submission.
        </p>
      </article>
    </main>
  );
}
