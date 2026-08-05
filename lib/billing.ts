import { env } from "cloudflare:workers";

export type Plan = "free" | "plus";
export const limits = {
  free: { matters: 1, entries: 25, evidence: 10, scans: 3, storage: 100 * 1024 * 1024 },
  plus: { matters: Number.MAX_SAFE_INTEGER, entries: Number.MAX_SAFE_INTEGER, evidence: Number.MAX_SAFE_INTEGER, scans: Number.MAX_SAFE_INTEGER, storage: 2 * 1024 * 1024 * 1024 },
};

export async function ensureEntitlements() {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS entitlements (
    owner_id TEXT PRIMARY KEY,
    plan TEXT NOT NULL DEFAULT 'free',
    provider TEXT,
    purchase_id TEXT,
    purchased_at INTEGER
  )`).run();
}

export async function getPlan(ownerId: string): Promise<Plan> {
  await ensureEntitlements();
  const row = await env.DB.prepare("SELECT plan FROM entitlements WHERE owner_id = ?").bind(ownerId).first<{plan:string}>();
  return row?.plan === "plus" ? "plus" : "free";
}
