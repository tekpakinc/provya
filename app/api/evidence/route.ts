import { env } from "cloudflare:workers";

function owner(request: Request) {
  const authenticated = request.headers.get("oai-authenticated-user-id");
  if (authenticated) return authenticated;
  const host = new URL(request.url).hostname;
  return host === "localhost" || host === "127.0.0.1" ? "local-preview" : null;
}

export async function POST(request: Request) {
  const ownerId = owner(request);
  if (!ownerId) return Response.json({ error: "Sign in required." }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  const evidenceId = String(form.get("evidenceId") || "");
  if (!(file instanceof File) || !evidenceId) return Response.json({ error: "Missing file or evidence id." }, { status: 400 });
  if (file.size > 50 * 1024 * 1024) return Response.json({ error: "Files are limited to 50 MB in this MVP." }, { status: 413 });
  const key = `${ownerId}/${evidenceId}`;
  await env.EVIDENCE.put(key, file.stream(), { httpMetadata: { contentType: file.type || "application/octet-stream" }, customMetadata: { filename: file.name } });
  return Response.json({ ok: true, key });
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
  const ownerId = owner(request);
  if (!ownerId) return Response.json({ error: "Sign in required." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  await env.EVIDENCE.delete(`${ownerId}/${id}`);
  return Response.json({ ok: true });
}
