import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
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
import { db, ordersTable, type StoredOrderItem } from "@workspace/db";
import { menuItems } from "./menu";

const router: IRouter = Router();

function createOrderNumber(): string {
  const date = new Date();
  const day = date.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `TOK-${day}-${suffix}`;
}

router.get("/orders", async (req, res): Promise<void> => {
  const orders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt));

  req.log.info({ count: orders.length }, "Listed orders");
  res.json(ListOrdersResponse.parse(orders));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid order request");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { customerName, customerPhone, fulfillmentMethod, deliveryAddress, notes } = parsed.data;
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
  const [order] = await db
    .insert(ordersTable)
    .values({
      orderNumber: createOrderNumber(),
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

router.get("/orders/:orderNumber", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderNumber, params.data.orderNumber));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(GetOrderResponse.parse(order));
});

router.patch("/orders/:orderNumber/payment", async (req, res): Promise<void> => {
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