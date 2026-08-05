import { LegalNotice, LegalShell } from "../legal-shell";

export default function RefundsPage() {
  return <LegalShell eyebrow="PURCHASES" title="Refund Policy">
    <LegalNotice />
    <h2>Try before purchasing</h2><p>The Free plan is available so you can evaluate PROVya before buying Plus.</p>
    <h2>Plus purchases</h2><p>You may request a refund within 14 days of the original Plus purchase. Send the purchase email and reason for the request to <a href="mailto:support@tekpakinc.net?subject=PROVya%20refund%20request">support@tekpakinc.net</a>. Approved refunds return to the original payment method; processing time depends on the payment provider.</p>
    <h2>Exceptions</h2><p>We may deny requests involving abuse, fraud, chargeback manipulation, or substantial use inconsistent with evaluating the product. This policy does not limit rights that cannot be waived under applicable law.</p>
    <h2>After a refund</h2><p>A refunded Plus account returns to Free limits. Export or reduce records before requesting a refund if the workspace exceeds those limits. Existing data may become read-only until it is brought within the Free allowance.</p>
  </LegalShell>;
}
