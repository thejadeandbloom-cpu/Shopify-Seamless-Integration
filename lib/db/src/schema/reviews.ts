import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productHandle: text("product_handle").notNull(),
  productLabel: text("product_label").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  city: text("city").notNull().default(""),
  orderId: text("order_id").notNull(),
  rating: integer("rating").notNull(),
  title: text("title").notNull().default(""),
  body: text("body").notNull(),
  imageUrl: text("image_url").notNull().default(""),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  visibleAfter: timestamp("visible_after", { withTimezone: true }).notNull(),
});

export type Review = typeof reviewsTable.$inferSelect;
