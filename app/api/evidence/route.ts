import { env } from "cloudflare:workers";
import { getPlan, limits } from "@/lib/billing";
import { crossSiteResponse, isSameOriginMutation } from "@/lib/request-security";

function owner(request: Request) {
  const authenticated = request.headers.get("oai-authenticated-user-id");
  if (authenticated) return authenticated;
  const host = new URL(request.url).hostname;
  return host === "localhost" || host === "127.0.0.1" ? "local-preview" : null;
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return crossSiteResponse();
  const ownerId = owner(request);
  if (!ownerId) return Response.json({ error: "Sign in required." }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  const evidenceId = String(form.get("evidenceId") || "");
  if (!(file instanceof File) || !evidenceId) return Response.json({ error: "Missing file or evidence id." }, { status: 400 });
  if (file.size > 50 * 1024 * 1024) return Response.json({ error: "Files are limited to 50 MB in this MVP." }, { status: 413 });
  const allowance = limits[await getPlan(ownerId)];
  let total = 0; let count = 0; let cursor: string | undefined;
  do {
    const listed = await env.EVIDENCE.list({ prefix: `${ownerId}/`, cursor });
    total += listed.objects.reduce((sum, object) => sum + object.size, 0); count += listed.objects.length;
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);
  if (count >= allowance.evidence || total + file.size > allowance.storage) return Response.json({ error: "Your evidence storage limit has been reached.", upgradeRequired: true }, { status: 402 });
  const bytes = await file.arrayBuffer();
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const claimedHash = String(form.get("hash") || "");
  if (claimedHash && claimedHash !== hash) return Response.json({ error: "The uploaded file did not match its calculated fingerprint." }, { status: 400 });
  const key = `${ownerId}/${evidenceId}`;
  await env.EVIDENCE.put(key, bytes, { httpMetadata: { contentType: file.type || "application/octet-stream" }, customMetadata: { filename: file.name, sha256: hash } });
  return Response.json({ ok: true, key, hash });
}

export async function GET(request: Request) {
  const ownerId = owner(request);
  if (!ownerId) return new Response("Sign in required", { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });
  const object = await env.EVIDENCE.get(`${ownerId}/${id}`);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("content-disposition", `attachment; filename="${(object.customMetadata?.filename || "evidence-file").replace(/[\r\n\"]/g, "")}"`);
  return new Response(object.body, { headers });
}

export async function DELETE(request: Request) {
  if (!isSameOriginMutation(request)) return crossSiteResponse();
  const ownerId = owner(request);
  if (!ownerId) return Response.json({ error: "Sign in required." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  await env.EVIDENCE.delete(`${ownerId}/${id}`);
  return Response.json({ ok: true });
}
