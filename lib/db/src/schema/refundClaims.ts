import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const refundClaimsTable = pgTable("refund_claims", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  orderId: text("order_id").notNull(),
  product: text("product").notNull(),
  purchaseDate: text("purchase_date").notNull(),
  reason: text("reason").notNull(),
  bankDetails: text("bank_details").notNull(),
  usageLog: text("usage_log").notNull().default(""),
  status: text("status").notNull().default("pending"),
  refunded: boolean("refunded").notNull().default(false),
  notes: text("notes").notNull().default(""),
  abuseFlag: text("abuse_flag").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertRefundClaimSchema = createInsertSchema(refundClaimsTable).omit({
  id: true,
  status: true,
  refunded: true,
  notes: true,
  abuseFlag: true,
  usageLog: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRefundClaim = z.infer<typeof insertRefundClaimSchema>;
export type RefundClaim = typeof refundClaimsTable.$inferSelect;
