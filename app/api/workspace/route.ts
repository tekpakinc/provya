import { env } from "cloudflare:workers";
import { getPlan, limits } from "@/lib/billing";
import { crossSiteResponse, isSameOriginMutation } from "@/lib/request-security";

function owner(request: Request) {
  const authenticated = request.headers.get("oai-authenticated-user-id");
  if (authenticated) return authenticated;
  const host = new URL(request.url).hostname;
  return host === "localhost" || host === "127.0.0.1" ? "local-preview" : null;
}

async function ready() {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS workspaces (
    owner_id TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  )`).run();
}

export async function GET(request: Request) {
  const ownerId = owner(request);
  if (!ownerId) return Response.json({ error: "Sign in required." }, { status: 401 });
  await ready();
  const row = await env.DB.prepare("SELECT payload, updated_at FROM workspaces WHERE owner_id = ?")
    .bind(ownerId).first<{ payload: string; updated_at: number }>();
  const plan = await getPlan(ownerId);
  return Response.json(row ? { workspace: JSON.parse(row.payload), updatedAt: row.updated_at, plan } : { workspace: null, plan });
}

export async function PUT(request: Request) {
  if (!isSameOriginMutation(request)) return crossSiteResponse();
  const ownerId = owner(request);
  if (!ownerId) return Response.json({ error: "Sign in required." }, { status: 401 });
  const workspace = await request.json();
  const plan = await getPlan(ownerId);
  const allowance = limits[plan];
  const matters = Array.isArray(workspace?.matters) ? workspace.matters : [];
  const entries = Array.isArray(workspace?.entries) ? workspace.entries : [];
  const evidence = Array.isArray(workspace?.evidence) ? workspace.evidence : [];
  const scans = evidence.filter((item: { transcription?: unknown }) => typeof item?.transcription === "string").length;
  const storage = evidence.reduce((sum: number, item: { size?: unknown }) => sum + (typeof item?.size === "number" ? item.size : 0), 0);
  if (matters.length > allowance.matters || entries.length > allowance.entries || evidence.length > allowance.evidence || scans > allowance.scans || storage > allowance.storage) {
    return Response.json({ error: "This workspace exceeds the current plan limits.", upgradeRequired: true }, { status: 402 });
  }
  const payload = JSON.stringify(workspace);
  if (payload.length > 2_000_000) return Response.json({ error: "Workspace is too large." }, { status: 413 });
  await ready();
  const now = Date.now();
  await env.DB.prepare(`INSERT INTO workspaces (owner_id, payload, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(owner_id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`)
    .bind(ownerId, payload, now).run();
  return Response.json({ ok: true, updatedAt: now });
}
