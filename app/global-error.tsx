"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body><main className="error-page"><div><b>PROVya</b><h1>Something didn&apos;t load correctly.</h1><p>Your saved records have not been changed. Try again, or contact support if the problem continues.</p><button onClick={reset}>Try again</button><a href="mailto:support@tekpakinc.net?subject=PROVya%20error">Contact support</a></div></main></body></html>;
}
