import { env } from "cloudflare:workers";
import { ensureEntitlements } from "@/lib/billing";

export async function GET(request: Request) {
  const ownerId = request.headers.get("oai-authenticated-user-id");
  if (!ownerId) return Response.json({ error: "Sign in required." }, { status: 401 });
  const runtime = env as unknown as { STRIPE_SECRET_KEY?: string };
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!runtime.STRIPE_SECRET_KEY || !sessionId) return Response.json({ error: "Purchase verification is unavailable." }, { status: 400 });
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, { headers: { authorization: `Bearer ${runtime.STRIPE_SECRET_KEY}` } });
  const session = await response.json() as { id?: string; payment_status?: string; client_reference_id?: string };
  if (!response.ok || session.payment_status !== "paid" || session.client_reference_id !== ownerId) return Response.json({ error: "Payment could not be verified." }, { status: 402 });
  await ensureEntitlements();
  await env.DB.prepare(`INSERT INTO entitlements (owner_id, plan, provider, purchase_id, purchased_at) VALUES (?, 'plus', 'stripe', ?, ?)
    ON CONFLICT(owner_id) DO UPDATE SET plan='plus', provider='stripe', purchase_id=excluded.purchase_id, purchased_at=excluded.purchased_at`).bind(ownerId, session.id, Date.now()).run();
  return Response.json({ ok: true, plan: "plus" });
}
