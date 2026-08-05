"use client";

import { useMemo, useRef, useState } from "react";

type View = "overview" | "evidence" | "conversation" | "timeline" | "packet";
type EvidenceItem = { id: number; name: string; type: string; date: string; source: string; hash: string; tag: string; status: string };

const initialEvidence: EvidenceItem[] = [
  { id: 1, name: "Move-in walkthrough", type: "Video", date: "Mar 02, 2026 · 10:14 AM", source: "iPhone 15 Pro", hash: "b4f94d8a…e021", tag: "Property condition", status: "Original preserved" },
  { id: 2, name: "Kitchen ceiling damage", type: "Photo set · 8 files", date: "May 18, 2026 · 7:42 PM", source: "PROVya capture", hash: "7e81c933…42af", tag: "Water damage", status: "Original preserved" },
  { id: 3, name: "Messages with property manager", type: "Conversation · 24 messages", date: "May 18–Jun 06, 2026", source: "iMazing PDF export", hash: "a19d0e42…8bd7", tag: "Notice provided", status: "Source linked" },
  { id: 4, name: "Emergency plumber receipt", type: "PDF · 2 pages", date: "May 19, 2026 · 3:08 PM", source: "Files import", hash: "23c4f65b…11d0", tag: "Expense", status: "Original preserved" },
  { id: 5, name: "Certified-mail delivery receipt", type: "PDF · 1 page", date: "Jun 07, 2026 · 11:20 AM", source: "Email attachment", hash: "ce6189ab…a59e", tag: "Notice provided", status: "Original preserved" },
];

const messages = [
  { side: "me", time: "May 18 · 7:51 PM", text: "Hi Jordan — water is coming through the kitchen ceiling again. I’ve attached current photos and moved everything away from the area." },
  { side: "them", time: "May 18 · 8:06 PM", text: "Thanks for letting me know. I’ll contact maintenance in the morning." },
  { side: "me", time: "May 19 · 9:18 AM", text: "The leak continued overnight and the ceiling is beginning to sag. Please confirm when someone is coming." },
  { side: "them", time: "May 19 · 10:02 AM", text: "Maintenance is backed up. Someone should be there this week." },
  { side: "me", time: "May 21 · 4:36 PM", text: "No one has arrived. I’m documenting the additional damage and need a firm repair date." },
];

const events = [
  { date: "MAR 02", title: "Move-in condition documented", detail: "Room-by-room walkthrough captured; no ceiling damage visible.", refs: "EX-01" },
  { date: "MAY 18", title: "Water intrusion discovered", detail: "Eight original photos and one video preserved at initial discovery.", refs: "EX-02" },
  { date: "MAY 18", title: "First written notice", detail: "Property manager acknowledged the report by text message.", refs: "EX-03 · p. 2" },
  { date: "MAY 19", title: "Emergency mitigation expense", detail: "Tenant retained emergency plumber after condition worsened.", refs: "EX-04" },
  { date: "JUN 07", title: "Formal notice delivered", detail: "Certified-mail delivery record imported and preserved.", refs: "EX-05" },
];

const nav: { id: View; label: string; count?: number }[] = [
  { id: "overview", label: "Matter overview" },
  { id: "evidence", label: "Evidence", count: 5 },
  { id: "conversation", label: "Conversation", count: 24 },
  { id: "timeline", label: "Timeline", count: 5 },
  { id: "packet", label: "Evidence packet" },
];

function Brand() { return <span className="demo-brand"><b>PROV</b><i>ya</i></span>; }

export default function DemoPage() {
  const [view, setView] = useState<View>("overview");
  const [evidence, setEvidence] = useState(initialEvidence);
  const [query, setQuery] = useState("");
  const [packetReady, setPacketReady] = useState(false);
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const filteredMessages = useMemo(() => messages.filter((m) => m.text.toLowerCase().includes(query.toLowerCase())), [query]);

  async function importFile(file?: File) {
    if (!file) return;
    const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
    const hash = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
    setEvidence((items) => [...items, { id: Date.now(), name: file.name, type: `${file.type || "File"} · ${(file.size / 1024).toFixed(1)} KB`, date: "Imported just now", source: "Local file import", hash: `${hash.slice(0, 8)}…${hash.slice(-4)}`, tag: "Needs review", status: "Original preserved" }]);
    setView("evidence");
    setNotice(`${file.name} preserved and hashed locally.`);
    setTimeout(() => setNotice(""), 3500);
  }

  function downloadManifest() {
    const manifest = { product: "PROVya Evidence Pack Demo", generated: new Date().toISOString(), matter: "Morgan v. Crestview Property Management", disclaimer: "Demonstration only. Not a forensic certification or legal advice.", files: evidence.map(({ name, type, date, source, hash, tag }) => ({ name, type, date, source, sha256_display: hash, tag })) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "provya-demo-integrity-manifest.json"; anchor.click(); URL.revokeObjectURL(url);
    setNotice("Integrity manifest downloaded."); setTimeout(() => setNotice(""), 3000);
  }

  return (
    <main className="demo-app">
      <header className="demo-topbar">
        <a href="/" aria-label="Back to PROVya home"><Brand /></a>
        <div className="demo-mode"><span /> Interactive product demo</div>
        <div className="top-actions"><button className="ghost-button" onClick={() => setView("packet")}>Preview packet</button><button className="dark-button" onClick={() => fileRef.current?.click()}>＋ Add evidence</button></div>
        <input ref={fileRef} className="sr-only" type="file" onChange={(event) => importFile(event.target.files?.[0])} />
      </header>

      <aside className="demo-sidebar">
        <div className="matter-switcher"><small>ACTIVE MATTER</small><b>Morgan v. Crestview</b><span>Housing · Sample data</span></div>
        <nav aria-label="Demo sections">{nav.map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}><span className={`nav-icon ${item.id}`} />{item.label}{item.count ? <em>{item.id === "evidence" ? evidence.length : item.count}</em> : null}</button>)}</nav>
        <div className="guide-card"><span>GUIDED COLLECTION</span><b>Housing condition</b><div><i style={{ width: "80%" }} /></div><small>4 of 5 recommended steps complete</small><button onClick={() => setView("overview")}>Continue checklist →</button></div>
        <div className="local-badge"><b>● Local-first demo</b><span>No sample data leaves this browser.</span></div>
      </aside>

      <section className="demo-main">
        {notice && <div className="demo-toast">✓ {notice}</div>}
        {view === "overview" && <Overview onNavigate={setView} evidenceCount={evidence.length} />}
        {view === "evidence" && <Evidence evidence={evidence} onImport={() => fileRef.current?.click()} />}
        {view === "conversation" && <Conversation query={query} setQuery={setQuery} messages={filteredMessages} />}
        {view === "timeline" && <Timeline />}
        {view === "packet" && <Packet ready={packetReady} setReady={setPacketReady} download={downloadManifest} evidenceCount={evidence.length} />}
      </section>
    </main>
  );
}

function PageHead({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy: string; action?: React.ReactNode }) {
  return <div className="demo-page-head"><div><span>{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>{action}</div>;
}

function Overview({ onNavigate, evidenceCount }: { onNavigate: (view: View) => void; evidenceCount: number }) {
  return <>
    <PageHead eyebrow="MATTER OVERVIEW" title="Build the record, not the argument." copy="PROVya preserves what you provide, shows what may be missing, and packages the record for review." action={<button className="outline-button" onClick={() => onNavigate("packet")}>View packet status →</button>} />
    <div className="metric-grid"><article><span>EVIDENCE ITEMS</span><b>{evidenceCount}</b><small>Across 4 source types</small></article><article><span>TIMELINE EVENTS</span><b>05</b><small>Mar 02 – Jun 07, 2026</small></article><article><span>INTEGRITY STATUS</span><b className="good">100%</b><small>All originals preserved</small></article></div>
    <div className="overview-grid">
      <section className="demo-panel checklist-panel"><div className="panel-title"><div><span>GUIDED PROTOCOL</span><h2>Housing-condition record</h2></div><em>4 / 5</em></div>
        {[ ["Document the starting condition", "Complete", true], ["Capture current damage", "Complete", true], ["Preserve written notice", "Complete", true], ["Add expenses and receipts", "Complete", true], ["Add repair outcome or final condition", "Recommended", false] ].map(([label,status,done]) => <button className="check-row" key={label as string}><i className={done ? "complete" : ""}>{done ? "✓" : "5"}</i><span><b>{label}</b><small>{status}</small></span><em>→</em></button>)}
      </section>
      <section className="demo-panel activity-panel"><div className="panel-title"><div><span>RECENT ACTIVITY</span><h2>Source history</h2></div><button onClick={() => onNavigate("evidence")}>View all</button></div>
        {initialEvidence.slice(0,4).map((item, index) => <div className="activity-row" key={item.id}><i>{["VID","IMG","TXT","PDF"][index]}</i><span><b>{item.name}</b><small>{item.date}</small></span><em>✓</em></div>)}
      </section>
    </div>
    <div className="demo-disclaimer"><b>What this demo means by “preserved”</b><p>PROVya retains the imported original and records a cryptographic hash. It does not independently prove who created the source, whether its contents are true, or whether a court will admit it.</p></div>
  </>;
}

function Evidence({ evidence, onImport }: { evidence: EvidenceItem[]; onImport: () => void }) {
  return <><PageHead eyebrow="SOURCE LIBRARY" title="Evidence, with its history attached." copy="Every item stays linked to its original source, import details, and integrity fingerprint." action={<button className="dark-button" onClick={onImport}>＋ Import a file</button>} />
    <div className="evidence-toolbar"><div><button className="selected">All items <span>{evidence.length}</span></button><button>Messages</button><button>Photos & video</button><button>Documents</button></div><button>Sort: Event date ↕</button></div>
    <div className="evidence-table"><div className="table-head"><span>ITEM</span><span>EVENT DATE</span><span>ISSUE TAG</span><span>INTEGRITY</span><span /></div>{evidence.map((item) => <div className="evidence-row" key={item.id}><div className="evidence-name"><i>{item.type.slice(0,3).toUpperCase()}</i><span><b>{item.name}</b><small>{item.type} · {item.source}</small></span></div><span>{item.date}</span><span><em className="tag">{item.tag}</em></span><span className="hash"><b>✓ {item.status}</b><small>SHA-256 {item.hash}</small></span><button aria-label={`Open ${item.name}`}>→</button></div>)}</div>
  </>;
}

function Conversation({ query, setQuery, messages }: { query: string; setQuery: (q: string) => void; messages: typeof initialMessages; }) {
  return <><PageHead eyebrow="SOURCE-PRESERVING TRANSCRIPT" title="Messages, readable and traceable." copy="Transcript text remains linked to the imported source. Corrections would be recorded without changing the original." />
    <div className="conversation-layout"><section className="thread-panel"><div className="thread-head"><div className="contact-avatar">JM</div><div><b>Jordan Miles</b><span>Property manager · +1 (555) 014-2870</span></div><em>24 messages · 3 attachments</em></div><div className="searchbox">⌕<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this conversation" /></div><div className="messages"><div className="date-rule"><span>MAY 18, 2026</span></div>{messages.map((message, i) => <div className={`message ${message.side}`} key={i}><small>{message.time}</small><p>{message.text}</p>{i === 0 && <button onClick={() => alert("In the full product, this opens the preserved source page and attachment metadata.")}>2 source photos ↗</button>}</div>)}</div></section>
      <aside className="source-panel"><span>SOURCE DETAILS</span><h3>iMazing PDF export</h3><dl><div><dt>Imported</dt><dd>Jun 08, 2026 · 2:14 PM</dd></div><div><dt>Participants</dt><dd>Morgan Lee, Jordan Miles</dd></div><div><dt>Date range</dt><dd>May 18 – Jun 06, 2026</dd></div><div><dt>File hash</dt><dd>a19d0e42…8bd7</dd></div></dl><div className="integrity-note"><b>✓ Source linked</b><p>This transcript is a readable derivative. The original PDF remains preserved and available for comparison.</p></div><button className="outline-button">View preserved source ↗</button></aside>
    </div>
  </>;
}

type initialMessages = typeof messages;

function Timeline() { return <><PageHead eyebrow="CHRONOLOGY" title="One record. In event order." copy="Connect messages, photos, expenses, and notices without altering the underlying files." action={<button className="outline-button">＋ Add event</button>} /><div className="timeline-view"><div className="timeline-line" />{events.map((event, i) => <article key={event.title}><div className="event-date">{event.date}<small>2026</small></div><i>{i + 1}</i><div><h3>{event.title}</h3><p>{event.detail}</p><span>{event.refs}</span></div><button>Review sources →</button></article>)}</div></>; }

function Packet({ ready, setReady, download, evidenceCount }: { ready: boolean; setReady: (r: boolean) => void; download: () => void; evidenceCount: number }) {
  return <><PageHead eyebrow="OUTPUT PREVIEW" title="A record someone else can follow." copy="The packet organizes the material. It does not make legal conclusions or guarantee admissibility." action={<button className="dark-button" onClick={() => setReady(true)}>{ready ? "✓ Packet prepared" : "Prepare demo packet →"}</button>} />
    <div className="packet-layout"><section className="packet-preview"><div className="paper-sheet"><div className="packet-cover"><Brand /><span>EVIDENCE PACKET · DEMONSTRATION</span><h2>Morgan v. Crestview<br />Property Management</h2><p>Housing-condition record</p><dl><div><dt>Prepared for</dt><dd>Morgan Lee</dd></div><div><dt>Record period</dt><dd>Mar 02 – Jun 07, 2026</dd></div><div><dt>Included</dt><dd>{evidenceCount} source items · 5 timeline events</dd></div></dl><footer><b>Source-preserving record</b><span>Generated by PROVya · A Tek-Pak Inc. product</span></footer></div></div><div className="page-stack">+ 18 pages</div></section>
      <aside className="packet-controls"><div className="packet-status"><span>PACKET READINESS</span><b>{ready ? "Ready to review" : "1 recommendation"}</b><div><i style={{width:ready ? "100%" : "88%"}} /></div><small>{ready ? "Demo packet assembled." : "Consider adding the final repair outcome."}</small></div>
        <h3>Included sections</h3>{["Cover and scope","Source inventory","Event chronology","Message transcript","Numbered exhibits","Integrity manifest"].map((x,i)=><div className="packet-section" key={x}><i>✓</i><span><b>{x}</b><small>{["1 page","2 pages","2 pages","6 pages","7 pages","2 pages"][i]}</small></span></div>)}
        <button className="download-button" onClick={download}>Download integrity manifest <span>↓</span></button><p className="fine-print">Demo output contains sample data only. PROVya is an organization and preservation tool, not a law firm or forensic examiner.</p>
      </aside>
    </div>
  </>;
}
