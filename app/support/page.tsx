import { LegalShell } from "../legal-shell";

export default function SupportPage() {
  return <LegalShell eyebrow="HELP & CONTACT" title="PROVya Support">
    <div className="support-callout"><h2>Need help?</h2><p>Email <a href="mailto:support@tekpakinc.net?subject=PROVya%20support">support@tekpakinc.net</a> with the email used to sign in, a short description, and screenshots that do not expose unnecessary sensitive information.</p><a className="button primary" href="mailto:support@tekpakinc.net?subject=PROVya%20support">Email support →</a></div>
    <h2>Account and data</h2><p>Open Account inside PROVya to export your current matter, download original files, sign out, or permanently delete the workspace and stored evidence.</p>
    <h2>Purchases</h2><p>Include the purchase email when asking about Plus access or refunds. Never email card numbers, passwords, government identification numbers, or Stripe credentials.</p>
    <h2>Urgent situations</h2><p>PROVya is not monitored for emergencies and cannot provide legal advice. Contact emergency services, your attorney, or an appropriate local professional when time or safety is critical.</p>
  </LegalShell>;
}
