import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import {
  CreateOrderBody,
  CreateOrderResponse,
  GetOrderParams,
  GetOrderResponse,
  ListOrdersResponse,
  UpdateOrderPaymentBody,
  UpdateOrderPaymentParams,
  UpdateOrderPaymentResponse,
} from "@workspace/api-zod";
import { db, ordersTable, type StoredOrderItem, userProfilesTable } from "@workspace/db";
import { menuItems } from "./menu";
import { getAuthenticatedUser, requireAdmin, requireAdminMfa, requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function createOrderNumber(): string {
  const date = new Date();
  const day = date.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `TOK-${day}-${suffix}`;
}

router.get("/orders", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const orders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt));

  req.log.info({ count: orders.length }, "Listed orders");
  res.json(ListOrdersResponse.parse(orders));
});

router.post("/orders", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid order request");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { customerName, customerPhone, fulfillmentMethod, deliveryAddress, notes } = parsed.data;
  const { user } = getAuthenticatedUser(req);
  if (fulfillmentMethod === "delivery" && !deliveryAddress?.trim()) {
    res.status(400).json({ error: "A delivery address is required for delivery orders." });
    return;
  }

  const orderItems: StoredOrderItem[] = [];
  for (const requestedItem of parsed.data.items) {
    const menuItem = menuItems.find((item) => item.id === requestedItem.menuItemId);
    if (!menuItem) {
      res.status(400).json({ error: `Menu item not found: ${requestedItem.menuItemId}` });
      return;
    }

    orderItems.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      quantity: requestedItem.quantity,
      unitPrice: menuItem.price,
      lineTotal: menuItem.price * requestedItem.quantity,
    });
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
  await db
    .insert(userProfilesTable)
    .values({
      authUserId: user.id,
      email: user.email ?? `${user.id}@no-email.invalid`,
      displayName: typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : typeof user.user_metadata?.name === "string"
          ? user.user_metadata.name
          : null,
      avatarUrl: typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null,
    })
    .onConflictDoUpdate({
      target: userProfilesTable.authUserId,
      set: {
        email: user.email ?? `${user.id}@no-email.invalid`,
        updatedAt: new Date(),
      },
    });

  const [order] = await db
    .insert(ordersTable)
    .values({
      orderNumber: createOrderNumber(),
      userId: user.id,
      customerName,
      customerPhone,
      fulfillmentMethod,
      deliveryAddress: deliveryAddress?.trim() || null,
      notes: notes?.trim() || null,
      items: orderItems,
      subtotal,
      deliveryFee: null,
      total: subtotal,
    })
    .returning();

  req.log.info({ orderNumber: order.orderNumber, total: order.total }, "Created order");
  res.status(201).json(CreateOrderResponse.parse(order));
});

router.get("/orders/:orderNumber", requireAuth, async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { user } = getAuthenticatedUser(req);
  const isAdmin = user.email ? (process.env.ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).includes(user.email.toLowerCase()) : false;
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(and(
      eq(ordersTable.orderNumber, params.data.orderNumber),
      ...(isAdmin ? [] : [eq(ordersTable.userId, user.id)]),
    ));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(GetOrderResponse.parse(order));
});

router.patch("/orders/:orderNumber/payment", requireAuth, requireAdmin, requireAdminMfa, async (req, res): Promise<void> => {
  const params = UpdateOrderPaymentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateOrderPaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [order] = await db
    .update(ordersTable)
    .set({
      paymentStatus: parsed.data.paymentStatus,
      orderStatus: parsed.data.paymentStatus === "confirmed" ? "preparing" : "awaiting_payment",
      staffNote: parsed.data.staffNote?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(ordersTable.orderNumber, params.data.orderNumber))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  req.log.info(
    { orderNumber: order.orderNumber, paymentStatus: order.paymentStatus },
    "Updated order payment",
  );
  res.json(UpdateOrderPaymentResponse.parse(order));
});

export default router;