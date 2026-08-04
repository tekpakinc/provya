const features = [
  { n: "01", title: "Capture the facts", copy: "Take photos, add notes, and lock in the details while they’re still fresh." },
  { n: "02", title: "Build the record", copy: "PROVya organizes every timestamp, location, and before-and-after into one clean timeline." },
  { n: "03", title: "Send the proof", copy: "Export a sharp, branded PDF report that’s ready for clients, claims, or your own records." },
];

const uses = ["Completed work", "Property condition", "Damage records", "Move-in / move-out", "Service delivery", "Before & after"];

export default function Home() {
  return (
    <main>
      <nav className="nav shell" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="PROVya home"><span>PROV</span><i>ya</i></a>
        <div className="navlinks">
          <a href="#how">How it works</a>
          <a href="#uses">Use cases</a>
          <a href="#early-access">Early access</a>
        </div>
        <a className="nav-cta" href="#early-access">Get PROVya <span>↗</span></a>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> Evidence made easy</div>
          <h1>When it matters,<br /><em>PROV</em> ya did it.</h1>
          <p className="lede">Turn photos, notes, and timestamps into a professional record—before the details get lost, disputed, or forgotten.</p>
          <div className="hero-actions">
            <a className="button primary" href="#early-access">Join early access <span>→</span></a>
            <a className="text-link" href="#how">See how it works <span>↓</span></a>
          </div>
          <div className="trust-row">
            <div><b>Private</b><span>Your records stay yours.</span></div>
            <div><b>Fast</b><span>Report-ready in minutes.</span></div>
            <div><b>Simple</b><span>No training required.</span></div>
          </div>
        </div>

        <div className="hero-visual" aria-label="PROVya app preview">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="float-card card-top"><span className="check">✓</span><div><b>Evidence secured</b><small>12 items documented</small></div></div>
          <div className="phone">
            <div className="phone-top"><span>9:41</span><i /></div>
            <div className="app-head"><div className="mini-brand">PROV<i>ya</i></div><span className="avatar">TP</span></div>
            <p className="screen-label">ACTIVE RECORD</p>
            <h3>Kitchen remodel</h3>
            <div className="meta"><span>● In progress</span><span>Aug 03, 2026</span></div>
            <div className="photo-grid">
              <div className="photo p1"><span>BEFORE</span></div>
              <div className="photo p2"><span>AFTER</span></div>
              <div className="photo p3"><span>DETAIL</span></div>
            </div>
            <div className="timeline">
              <div><i className="done">✓</i><p><b>Arrival condition</b><span>8 photos · 9:08 AM</span></p></div>
              <div><i className="done">✓</i><p><b>Work completed</b><span>4 photos · 2:42 PM</span></p></div>
              <div><i>3</i><p><b>Client sign-off</b><span>Ready to complete</span></p></div>
            </div>
            <button className="report-button">Generate proof report <span>↗</span></button>
          </div>
          <div className="float-card card-bottom"><span className="pdf">PDF</span><div><b>Report ready</b><small>Clean. Branded. Shareable.</small></div></div>
        </div>
      </section>

      <section className="ticker" aria-label="PROVya benefits"><div>PHOTO PROOF <span>✦</span> CLEAR TIMELINES <span>✦</span> INSTANT REPORTS <span>✦</span> FEWER DISPUTES <span>✦</span> PHOTO PROOF <span>✦</span> CLEAR TIMELINES</div></section>

      <section className="how shell" id="how">
        <div className="section-head"><span>HOW IT WORKS</span><h2>From “I did it”<br />to <em>“here’s the proof.”</em></h2></div>
        <div className="feature-list">
          {features.map((feature) => <article key={feature.n}>
            <span className="feature-num">{feature.n}</span>
            <h3>{feature.title}</h3>
            <p>{feature.copy}</p>
            <span className="feature-arrow">↗</span>
          </article>)}
        </div>
      </section>

      <section className="use-section" id="uses">
        <div className="shell use-grid">
          <div className="use-copy">
            <span className="kicker">ONE APP. A SOLID RECORD.</span>
            <h2>If there&apos;s a chance they&apos;ll ask,<br /><em>PROVya.</em></h2>
            <p>For the work you finish, the property you protect, and the details nobody should have to remember from memory.</p>
            <a className="button light" href="#early-access">Get early access <span>→</span></a>
          </div>
          <div className="use-list">
            {uses.map((use, index) => <div key={use}><span>0{index + 1}</span><b>{use}</b><i>↗</i></div>)}
          </div>
        </div>
      </section>

      <section className="quote shell">
        <p>“A picture says a thousand words.<br /><em>PROVya puts them in order.</em>”</p>
        <span>BUILT FOR PEOPLE WHO GET THINGS DONE.</span>
      </section>

      <section className="cta-wrap shell" id="early-access">
        <div className="cta-panel">
          <span className="cta-mark">P<span>✓</span></span>
          <div><span className="kicker">COMING SOON</span><h2>Be first to<br /><em>PROV it.</em></h2></div>
          <div className="signup">
            <p>Join the early-access list for launch news, founder pricing, and first dibs.</p>
            <form><label className="sr-only" htmlFor="email">Email address</label><input id="email" type="email" placeholder="you@company.com" required /><button type="submit">I&apos;m in <span>→</span></button></form>
            <small>No spam. Just PROVya updates.</small>
          </div>
        </div>
      </section>

      <footer className="shell footer">
        <div className="brand footer-brand"><span>PROV</span><i>ya</i></div>
        <p>Evidence made easy.<br />A Tek-Pak Inc. product.</p>
        <div><a href="#top">Privacy</a><a href="#top">Terms</a><a href="#top">Contact</a></div>
        <span>© 2026 TEK-PAK INC.</span>
      </footer>
    </main>
  );
}
