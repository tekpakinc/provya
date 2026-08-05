import { LegalNotice, LegalShell } from "../legal-shell";

export default function TermsPage() {
  return <LegalShell eyebrow="PRODUCT TERMS" title="Terms of Use">
    <LegalNotice />
    <h2>Agreement</h2><p>By accessing PROVya, you agree to these terms and the Privacy Policy. PROVya is a product of Tek-Pak Inc. If you do not agree, do not use the service.</p>
    <h2>What PROVya does</h2><p>PROVya helps users organize records, preserve uploaded source files, create user-reviewed transcriptions, and export structured information. It is an organizational tool—not a law firm, legal service, forensic laboratory, evidence custodian, or emergency service.</p>
    <h2>No legal advice or guaranteed outcome</h2><p>PROVya does not determine truth, verify authorship, establish chain of custody before upload, guarantee authenticity or admissibility, or predict the outcome of any dispute. File fingerprints can detect whether stored bytes later change; they do not prove that the original content was true or lawfully obtained. Consult a qualified professional for legal advice.</p>
    <h2>Your responsibilities</h2><p>You are responsible for your account, the accuracy of your entries, reviewing automated transcriptions, preserving originals when appropriate, and ensuring that you have the right to collect, record, upload, use, or share the material. Do not upload unlawful content, malware, or material that violates another person&apos;s privacy or intellectual-property rights.</p>
    <h2>License and plans</h2><p>Tek-Pak grants you a limited, personal, non-transferable license to use PROVya under your selected plan. “Lifetime” refers to access to the purchased PROVya Plus license for as long as Tek-Pak operates and supports the service; it does not promise perpetual operation, unlimited storage, or every future product. Hosted storage remains subject to the stated cap and reasonable technical limits.</p>
    <h2>Availability and changes</h2><p>We may maintain, secure, modify, suspend, or discontinue features when reasonably necessary. We may restrict abusive or unlawful use. Where practical, we will provide notice and an opportunity to export records before a planned discontinuation.</p>
    <h2>Disclaimers and liability</h2><p>PROVya is provided on an “as available” basis to the extent permitted by law. Tek-Pak disclaims implied warranties and is not responsible for legal outcomes, user-created content, missed deadlines, unauthorized collection, or losses caused by relying on automated transcription. Liability is limited to the amount you paid for PROVya during the preceding twelve months, except where applicable law does not permit that limitation.</p>
    <h2>Contact</h2><p>Questions, notices, or concerns may be sent to <a href="mailto:support@tekpakinc.net">support@tekpakinc.net</a>.</p>
  </LegalShell>;
}
