import { Router, type IRouter } from "express";
import { ListMenuItemsResponse } from "@workspace/api-zod";

export const menuItems = [
  {
    id: "crispy-bites",
    name: "Crispy Bites",
    category: "Starter",
    description: "The first hello. Golden, crackling, made for passing around.",
    price: 35000,
  },
  {
    id: "signature-plates",
    name: "Signature Plates",
    category: "Main",
    description: "Big flavour, considered right down to the last detail.",
    price: 20000,
  },
  {
    id: "golden-fries",
    name: "Golden Fries",
    category: "Sides",
    description: "Crisp edges, soft centres, no regrets.",
    price: 15000,
  },
] as const;

const router: IRouter = Router();

router.get("/menu-items", (_req, res): void => {
  res.json(ListMenuItemsResponse.parse(menuItems));
});

export default router;