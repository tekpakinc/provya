import { LegalNotice, LegalShell } from "../legal-shell";

export default function PrivacyPage() {
  return <LegalShell eyebrow="YOUR INFORMATION" title="Privacy Policy">
    <LegalNotice />
    <h2>What PROVya collects</h2><p>PROVya stores the account identifier and email supplied by the sign-in provider, the matters and timeline entries you create, uploaded evidence, file metadata and fingerprints, plan status, and purchase identifiers. Payment-card details are handled by Stripe and are not stored by PROVya.</p>
    <h2>Why we use it</h2><p>We use this information to provide your private workspace, preserve and retrieve your files, enforce plan limits, verify purchases, respond to support requests, protect the service, and comply with lawful obligations.</p>
    <h2>Storage and processing</h2><p>Workspace records are kept in managed database storage and evidence files in managed object storage. Browser-based handwriting recognition processes the selected image on your device; the original and the reviewed transcription are uploaded only when you choose to save them.</p>
    <h2>Sharing</h2><p>Tek-Pak does not sell your personal information. Information is shared only with service providers needed to operate PROVya, when you direct us to share or export it, or when disclosure is legally required. Service providers may include hosting, authentication, payment, and support providers.</p>
    <h2>Retention and deletion</h2><p>Your records remain until you delete individual items or request account deletion. The in-app Delete account control removes the current workspace, stored evidence, and plan record. Limited records may be retained when legally required, for fraud prevention, or for financial recordkeeping.</p>
    <h2>Your choices</h2><p>You can export a matter at any time, download original evidence, delete individual items, or permanently delete the entire PROVya account. Contact <a href="mailto:support@tekpakinc.net">support@tekpakinc.net</a> for privacy questions or an assisted request.</p>
    <h2>Security and sensitive content</h2><p>We use access controls and encrypted network connections, but no system is risk-free. Upload only material you are legally permitted to possess and store. Do not use PROVya for emergencies.</p>
    <h2>Children</h2><p>PROVya is intended for adults. It is not directed to children under 13. Adults documenting parenting matters should minimize unnecessary sensitive information about children.</p>
    <h2>Changes</h2><p>We may update this policy as the product changes. Material updates will be posted here with a new effective date.</p>
  </LegalShell>;
}
