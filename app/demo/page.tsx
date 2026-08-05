"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type View = "overview" | "evidence" | "conversation" | "timeline" | "packet";
type EvidenceItem = { id: number; name: string; type: string; date: string; source: string; hash: string; tag: string; status: string };
type Matter = { id: number; title: string; type: string; role: string; status: string };
type Choice = { value: string; other: string };

const defaultMatters: Matter[] = [
  { id: 1, title: "Morgan v. Crestview", type: "Housing & property", role: "Tenant", status: "Active" },
  { id: 2, title: "Parenting record", type: "Family & parenting", role: "Parent", status: "Ongoing" },
  { id: 3, title: "Rivera Design project", type: "Freelance work", role: "Service provider", status: "Active" },
];

const eventChoices: Record<string, string[]> = {
  "Family & parenting": ["Exchange", "Schedule change", "Communication", "Child-related expense", "School", "Medical", "Missed parenting time", "Incident"],
  "Freelance work": ["Scope or requirement", "Approval", "Delivery", "Invoice", "Payment", "Expense", "Feedback", "Communication"],
  "Automotive repair": ["Intake condition", "Authorization", "Diagnostic", "Existing damage", "Repair progress", "Parts", "Road test", "Pickup or sign-off"],
  "Contractor project": ["Site condition", "Scope", "Change order", "Approval", "Progress", "Concealed work", "Completion", "Payment"],
  "Housing & property": ["Condition", "Maintenance request", "Notice", "Repair", "Expense", "Communication", "Inspection"],
};

function resolved(choice: Choice) { return choice.value === "Other" ? choice.other.trim() : choice.value; }

function SelectWithOther({ label, options, choice, onChange, required = false }: { label: string; options: string[]; choice: Choice; onChange: (next: Choice) => void; required?: boolean }) {
  return <label className="smart-field"><span>{label}</span><select required={required} value={choice.value} onChange={(e) => onChange({ value: e.target.value, other: "" })}><option value="">Select one</option>{options.map((option) => <option key={option}>{option}</option>)}<option>Other</option></select>{choice.value === "Other" && <input autoFocus placeholder={`Type ${label.toLowerCase()}`} value={choice.other} onChange={(e) => onChange({ ...choice, other: e.target.value })} />}</label>;
}

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
  const [matters, setMatters] = useState(defaultMatters);
  const [activeMatterId, setActiveMatterId] = useState(1);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showNewMatter, setShowNewMatter] = useState(false);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const activeMatter = matters.find((matter) => matter.id === activeMatterId) || matters[0];

  useEffect(() => { setShowOnboarding(!localStorage.getItem("provya-demo-profile")); }, []);

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
        <div className="top-actions"><button className="ghost-button" onClick={() => setShowOnboarding(true)}>Edit profile</button><button className="ghost-button" onClick={() => setView("packet")}>Preview packet</button><button className="dark-button" onClick={() => setShowNewEntry(true)}>+ New entry</button></div>
        <input ref={fileRef} className="sr-only" type="file" onChange={(event) => importFile(event.target.files?.[0])} />
      </header>

      <aside className="demo-sidebar">
        <div className="matter-switcher"><small>ACTIVE MATTER</small><b>{activeMatter.title}</b><span>{activeMatter.type} · {activeMatter.status}</span></div>
        <nav aria-label="Demo sections">{nav.map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}><span className={`nav-icon ${item.id}`} />{item.label}{item.count ? <em>{item.id === "evidence" ? evidence.length : item.count}</em> : null}</button>)}</nav>
        <div className="guide-card"><span>GUIDED COLLECTION</span><b>Housing condition</b><div><i style={{ width: "80%" }} /></div><small>4 of 5 recommended steps complete</small><button onClick={() => setView("overview")}>Continue checklist →</button></div>
        <div className="local-badge"><b>● Local-first demo</b><span>No sample data leaves this browser.</span></div>
      </aside>

      <section className="demo-main">
        <div className="matter-tabs" aria-label="Your matters">{matters.map((matter) => <button key={matter.id} className={matter.id === activeMatterId ? "active" : ""} onClick={() => { setActiveMatterId(matter.id); setView("overview"); }}><small>{matter.type}</small><b>{matter.title}</b></button>)}<button className="add-matter" onClick={() => setShowNewMatter(true)}>+ New matter</button></div>
        {notice && <div className="demo-toast">✓ {notice}</div>}
        {view === "overview" && <Overview onNavigate={setView} evidenceCount={evidence.length} />}
        {view === "evidence" && <Evidence evidence={evidence} onImport={() => fileRef.current?.click()} />}
        {view === "conversation" && <Conversation query={query} setQuery={setQuery} messages={filteredMessages} />}
        {view === "timeline" && <Timeline />}
        {view === "packet" && <Packet ready={packetReady} setReady={setPacketReady} download={downloadManifest} evidenceCount={evidence.length} />}
      </section>
      {showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} />}
      {showNewMatter && <NewMatter onClose={() => setShowNewMatter(false)} onSave={(matter) => { setMatters((all) => [...all, matter]); setActiveMatterId(matter.id); setShowNewMatter(false); setNotice("Matter created and workspace tailored."); setTimeout(() => setNotice(""), 3000); }} />}
      {showNewEntry && <NewEntry matters={matters} activeMatter={activeMatter} onClose={() => setShowNewEntry(false)} onSave={(summary) => { setShowNewEntry(false); setNotice(summary); setTimeout(() => setNotice(""), 3500); }} />}
    </main>
  );
}

function PageHead({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy: string; action?: React.ReactNode }) {
  return <div className="demo-page-head"><div><span>{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>{action}</div>;
}

function Modal({ title, eyebrow, children, onClose }: { title: string; eyebrow: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop"><section className="provya-modal" role="dialog" aria-modal="true" aria-label={title}><button className="modal-close" onClick={onClose} aria-label="Close">×</button><small className="modal-eyebrow">{eyebrow}</small><h2>{title}</h2>{children}</section></div>;
}

function Onboarding({ onClose }: { onClose: () => void }) {
  const [userType, setUserType] = useState<Choice>({ value: "", other: "" });
  const [purpose, setPurpose] = useState<Choice>({ value: "", other: "" });
  const save = () => { if (!resolved(userType) || !resolved(purpose)) return; localStorage.setItem("provya-demo-profile", JSON.stringify({ userType: resolved(userType), purpose: resolved(purpose) })); onClose(); };
  return <Modal eyebrow="LET'S PERSONALIZE PROVYA" title="What are you documenting?" onClose={onClose}><p className="modal-lede">Your answers tailor suggested fields, event types, and checklists. You can keep completely different matters in one account.</p><div className="modal-grid"><SelectWithOther required label="I am a" options={["Self-represented person", "Parent or caregiver", "Freelancer or contractor", "Business or service provider", "Attorney or legal professional", "Attorney's client"]} choice={userType} onChange={setUserType} /><SelectWithOther required label="My first matter is about" options={["Family & parenting", "Housing & property", "Freelance work", "Automotive repair", "Contractor project", "Shipping or delivery", "Legal or administrative"]} choice={purpose} onChange={setPurpose} /></div><div className="privacy-note">🔒 Demo settings stay in this browser.</div><button className="dark-button modal-primary" disabled={!resolved(userType) || !resolved(purpose)} onClick={save}>Build my workspace →</button></Modal>;
}

function NewMatter({ onClose, onSave }: { onClose: () => void; onSave: (matter: Matter) => void }) {
  const [title, setTitle] = useState(""); const [type, setType] = useState<Choice>({ value: "", other: "" }); const [role, setRole] = useState<Choice>({ value: "", other: "" }); const [status, setStatus] = useState<Choice>({ value: "Active", other: "" });
  return <Modal eyebrow="NEW MATTER" title="Create a focused workspace" onClose={onClose}><p className="modal-lede">The matter type controls the quick choices PROVya offers when you document something.</p><div className="modal-grid"><label className="smart-field full"><span>Matter name</span><input placeholder="e.g. Parenting record — 2026" value={title} onChange={(e) => setTitle(e.target.value)} /></label><SelectWithOther label="Matter type" options={["Family & parenting", "Housing & property", "Freelance work", "Automotive repair", "Contractor project", "Shipping or delivery", "Legal or administrative"]} choice={type} onChange={setType} /><SelectWithOther label="Your role" options={["Parent", "Tenant", "Property owner", "Client", "Service provider", "Vehicle owner", "Attorney", "Self-represented person"]} choice={role} onChange={setRole} /><SelectWithOther label="Status" options={["Active", "Ongoing", "Waiting", "Resolved", "Archived"]} choice={status} onChange={setStatus} /></div><button className="dark-button modal-primary" disabled={!title.trim() || !resolved(type)} onClick={() => onSave({ id: Date.now(), title: title.trim(), type: resolved(type), role: resolved(role) || "Not specified", status: resolved(status) })}>Create matter →</button></Modal>;
}

function NewEntry({ matters, activeMatter, onClose, onSave }: { matters: Matter[]; activeMatter: Matter; onClose: () => void; onSave: (summary: string) => void }) {
  const [matterId, setMatterId] = useState(String(activeMatter.id)); const selected = matters.find((m) => String(m.id) === matterId) || activeMatter;
  const [kind, setKind] = useState<Choice>({ value: "", other: "" }); const [party, setParty] = useState<Choice>({ value: "", other: "" }); const [outcome, setOutcome] = useState<Choice>({ value: "", other: "" }); const [source, setSource] = useState<Choice>({ value: "", other: "" }); const [notes, setNotes] = useState("");
  return <Modal eyebrow="QUICK ADD" title="Add a documented entry" onClose={onClose}><div className="modal-grid"><label className="smart-field"><span>Matter</span><select value={matterId} onChange={(e) => { setMatterId(e.target.value); setKind({ value: "", other: "" }); }}>{matters.map((matter) => <option value={matter.id} key={matter.id}>{matter.title}</option>)}</select></label><SelectWithOther label="Entry type" options={eventChoices[selected.type] || ["Communication", "Agreement", "Incident", "Expense", "Document", "Milestone"]} choice={kind} onChange={setKind} /><SelectWithOther label="Person or party" options={["Me", "Co-parent", "Client", "Customer", "Attorney", "Contractor", "Property manager", "Repair shop"]} choice={party} onChange={setParty} /><SelectWithOther label="Outcome or status" options={["Completed", "Acknowledged", "Agreed", "Declined", "No response", "Pending", "Disputed"]} choice={outcome} onChange={setOutcome} /><SelectWithOther label="Source" options={["In-app note", "Text message", "Email", "Photo or video", "Receipt or invoice", "PDF or document", "Phone call summary"]} choice={source} onChange={setSource} /><label className="smart-field"><span>Date and time</span><input type="datetime-local" /></label><label className="smart-field full"><span>What happened?</span><textarea placeholder="Keep it factual. Add files after saving if needed." value={notes} onChange={(e) => setNotes(e.target.value)} /></label></div><button className="dark-button modal-primary" disabled={!resolved(kind)} onClick={() => onSave(`${resolved(kind)} added to ${selected.title}.`)}>Save documented entry →</button></Modal>;
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
