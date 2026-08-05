import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const workspaces = sqliteTable("workspaces", {
  ownerId: text("owner_id").primaryKey(),
  payload: text("payload").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const entitlements = sqliteTable("entitlements", {
  ownerId: text("owner_id").primaryKey(),
  plan: text("plan").notNull().default("free"),
  provider: text("provider"),
  purchaseId: text("purchase_id"),
  purchasedAt: integer("purchased_at"),
});
