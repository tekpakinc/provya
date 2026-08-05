import { env } from "cloudflare:workers";

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
  return Response.json(row ? { workspace: JSON.parse(row.payload), updatedAt: row.updated_at } : { workspace: null });
}

export async function PUT(request: Request) {
  const ownerId = owner(request);
  if (!ownerId) return Response.json({ error: "Sign in required." }, { status: 401 });
  const workspace = await request.json();
  const payload = JSON.stringify(workspace);
  if (payload.length > 2_000_000) return Response.json({ error: "Workspace is too large." }, { status: 413 });
  await ready();
  const now = Date.now();
  await env.DB.prepare(`INSERT INTO workspaces (owner_id, payload, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(owner_id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`)
    .bind(ownerId, payload, now).run();
  return Response.json({ ok: true, updatedAt: now });
}
