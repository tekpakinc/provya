import { env } from "cloudflare:workers";

function user(request: Request) {
  return { id: request.headers.get("oai-authenticated-user-id"), email: request.headers.get("oai-authenticated-user-email") };
}

export async function POST(request: Request) {
  const current = user(request);
  if (!current.id) return Response.json({ error: "Sign in required." }, { status: 401 });
  const runtime = env as unknown as { STRIPE_SECRET_KEY?: string; STRIPE_PRICE_ID?: string };
  if (!runtime.STRIPE_SECRET_KEY || !runtime.STRIPE_PRICE_ID) return Response.json({ error: "Purchases are not open yet. Please check back shortly." }, { status: 503 });
  const origin = new URL(request.url).origin;
  const body = new URLSearchParams({ mode: "payment", "line_items[0][price]": runtime.STRIPE_PRICE_ID, "line_items[0][quantity]": "1", client_reference_id: current.id, success_url: `${origin}/demo?checkout={CHECKOUT_SESSION_ID}`, cancel_url: `${origin}/demo?upgrade=cancelled` });
  if (current.email) body.set("customer_email", current.email);
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { authorization: `Bearer ${runtime.STRIPE_SECRET_KEY}`, "content-type": "application/x-www-form-urlencoded" }, body });
  const session = await response.json() as { url?: string; error?: { message?: string } };
  if (!response.ok || !session.url) return Response.json({ error: session.error?.message || "Checkout could not be started." }, { status: 502 });
  return Response.json({ url: session.url });
}
