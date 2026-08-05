import { env } from "cloudflare:workers";

export async function GET() {
  try {
    await env.DB.prepare("SELECT 1 AS ok").first();
    await env.EVIDENCE.head("__provya_healthcheck__");
    return Response.json({ status: "ok", checkedAt: new Date().toISOString() }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("PROVya health check failed", error);
    return Response.json({ status: "unavailable" }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
