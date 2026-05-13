import express from "express";
const router = express.Router();
export default router;

import {
  createOrder,
  getOrdersByUserId,
  getOrderById,
} from "#db/queries/orders";
import { createOrderProduct } from "#db/queries/ordersproducts";
import { getProductsByOrderId } from "#db/queries/products";
import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";

router.use(requireUser);

router.post("/", requireBody(["date"]), async (req, res) => {
  const { date, note } = req.body;
  const order = await createOrder(req.user.id, date, note);
  res.status(201).send(order);
});

router.get("/", async (req, res) => {
  const orders = await getOrdersByUserId(req.user.id);
  res.send(orders);
});

router.param("id", async (req, res, next, id) => {
  const order = await getOrderById(id);
  if (!order) return res.status(404).send("Order not found");

  if (order.user_id !== req.user.id)
    return res.status(403).send("Not your order");

  req.order = order;
  next();
});

router.get("/:id", (req, res) => {
  res.send(req.order);
});

router.post(
  "/:id/products",
  requireBody(["productId", "quantity"]),
  async (req, res) => {
    const { productId, quantity } = req.body;
    const orderProduct = await createOrderProduct(
      req.order.id,
      productId,
      quantity,
    );
    res.status(201).send(orderProduct);
  },
);

router.get("/:id/products", async (req, res) => {
  const products = await getProductsByOrderId(req.order.id);
  res.send(products);
});
