import { env } from "cloudflare:workers";
import { getPlan, limits } from "@/lib/billing";
import { crossSiteResponse, isSameOriginMutation } from "@/lib/request-security";

function identity(request: Request) {
  return { id: request.headers.get("oai-authenticated-user-id"), email: request.headers.get("oai-authenticated-user-email") };
}

async function storedObjects(ownerId: string) {
  const objects: { key: string; size: number; uploaded: string }[] = [];
  let cursor: string | undefined;
  do {
    const page = await env.EVIDENCE.list({ prefix: `${ownerId}/`, cursor });
    objects.push(...page.objects.map((object) => ({ key: object.key, size: object.size, uploaded: object.uploaded.toISOString() })));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return objects;
}

export async function GET(request: Request) {
  const current = identity(request);
  if (!current.id) return Response.json({ error: "Sign in required." }, { status: 401 });
  const [row, plan, objects] = await Promise.all([
    env.DB.prepare("SELECT payload, updated_at FROM workspaces WHERE owner_id = ?").bind(current.id).first<{ payload: string; updated_at: number }>(),
    getPlan(current.id),
    storedObjects(current.id),
  ]);
  const storage = objects.reduce((sum, object) => sum + object.size, 0);
  return Response.json({
    account: { email: current.email, plan, storage, storageLimit: limits[plan].storage },
    export: { generatedAt: new Date().toISOString(), workspace: row ? JSON.parse(row.payload) : null, updatedAt: row?.updated_at ?? null, evidenceManifest: objects.map((object) => ({ ...object, id: object.key.slice(current.id.length + 1) })) },
  });
}

export async function DELETE(request: Request) {
  if (!isSameOriginMutation(request)) return crossSiteResponse();
  const current = identity(request);
  if (!current.id) return Response.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { confirmation?: string } | null;
  if (body?.confirmation !== "DELETE") return Response.json({ error: "Type DELETE to confirm permanent account deletion." }, { status: 400 });
  const objects = await storedObjects(current.id);
  for (let index = 0; index < objects.length; index += 1000) await env.EVIDENCE.delete(objects.slice(index, index + 1000).map((object) => object.key));
  await env.DB.batch([
    env.DB.prepare("DELETE FROM workspaces WHERE owner_id = ?").bind(current.id),
    env.DB.prepare("DELETE FROM entitlements WHERE owner_id = ?").bind(current.id),
  ]);
  return Response.json({ ok: true, deletedFiles: objects.length });
}
