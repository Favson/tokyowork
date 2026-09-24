import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export type StoredOrderItem = {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: text("user_id"),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  fulfillmentMethod: text("fulfillment_method").notNull(),
  deliveryAddress: text("delivery_address"),
  notes: text("notes"),
  items: jsonb("items").$type<StoredOrderItem[]>().notNull(),
  subtotal: integer("subtotal").notNull(),
  deliveryFee: integer("delivery_fee"),
  total: integer("total").notNull(),
  paymentMethod: text("payment_method").notNull().default("bank_transfer"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  orderStatus: text("order_status").notNull().default("awaiting_payment"),
  staffNote: text("staff_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Order = typeof ordersTable.$inferSelect;