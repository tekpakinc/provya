import type { ReactNode } from "react";

export function LegalShell({ eyebrow, title, updated = "August 5, 2026", children }: { eyebrow: string; title: string; updated?: string; children: ReactNode }) {
  return <main className="legal-page">
    <nav className="legal-nav"><a className="mvp-wordmark" href="/">PROV<span>ya</span></a><a href="/">Back to PROVya</a></nav>
    <article className="legal-card"><span>{eyebrow}</span><h1>{title}</h1><p className="legal-updated">Last updated: {updated}</p>{children}</article>
    <footer className="legal-footer"><span>A Tek-Pak Inc. product</span><div><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/refunds">Refunds</a><a href="/support">Support</a></div></footer>
  </main>;
}

export function LegalNotice() {
  return <div className="legal-notice"><b>Plain-language summary</b><p>This page explains PROVya&apos;s current practices. It should be reviewed by Tek-Pak&apos;s licensed counsel before a large-scale launch or entry into regulated markets.</p></div>;
}
