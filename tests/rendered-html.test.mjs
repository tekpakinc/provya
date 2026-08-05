import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("publishes launch disclosures and security headers", async () => {
  const [page, worker] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("worker/index.ts", root), "utf8"),
  ]);
  assert.match(page, /PROVya/i);
  assert.match(page, /does not provide legal advice/i);
  assert.match(page, /href="\/privacy"/i);
  assert.match(page, /href="\/terms"/i);
  assert.match(page, /href="\/refunds"/i);
  assert.match(page, /href="\/support"/i);
  assert.match(worker, /x-content-type-options/);
  assert.match(worker, /frame-ancestors 'none'/);
});

test("keeps sensitive APIs owner-scoped and provides account deletion", async () => {
  const [workspace, evidence, account] = await Promise.all([
    readFile(new URL("app/api/workspace/route.ts", root), "utf8"),
    readFile(new URL("app/api/evidence/route.ts", root), "utf8"),
    readFile(new URL("app/api/account/route.ts", root), "utf8"),
  ]);
  assert.match(workspace, /oai-authenticated-user-id/);
  assert.match(evidence, /oai-authenticated-user-id/);
  assert.match(evidence, /SHA-256/);
  assert.match(account, /export async function DELETE/);
  assert.match(account, /confirmation !== "DELETE"/);
  assert.match(account, /DELETE FROM workspaces WHERE owner_id = \?/);
});

test("declares managed database and evidence storage", async () => {
  const hosting = JSON.parse(await readFile(new URL(".openai/hosting.json", root), "utf8"));
  assert.equal(hosting.d1, "DB");
  assert.equal(hosting.r2, "EVIDENCE");
});

test("ships an installable app without offline-caching private records", async () => {
  const [manifest, layout, serviceWorker] = await Promise.all([
    readFile(new URL("app/manifest.ts", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("public/sw.js", root), "utf8"),
  ]);
  assert.match(manifest, /display: "standalone"/);
  assert.match(manifest, /provya-logo-v2\.png/);
  assert.match(layout, /appleWebApp/);
  assert.match(layout, /InstallPrompt/);
  assert.match(serviceWorker, /url\.pathname\.startsWith\("\/api\/"\)/);
  assert.match(serviceWorker, /url\.pathname\.startsWith\("\/demo"\)/);
});
