const express = require("express");
const { body, param, query, oneOf } = require("express-validator");
const {
  createOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
} = require("../controllers/orders.controller");
const { authenticate } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

const router = express.Router();

router.use(authenticate);

router.post(
  "/",
  [
    oneOf([body("customer_id").isUUID(), body("customer_id").isInt()], "Invalid customer id"),
    body("items").isArray({ min: 1 }),
    oneOf(
      [body("items.*.product_id").isUUID(), body("items.*.product_id").isInt()],
      "Invalid product id"
    ),
    body("items.*.quantity").isInt({ min: 1 }),
    body("items.*.unit_price").optional().isFloat({ min: 0 }),
    validate,
  ],
  createOrder
);

router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("pageSize").optional().isInt({ min: 1, max: 100 }),
    validate,
  ],
  listOrders
);

router.get(
  "/:id",
  [oneOf([param("id").isUUID(), param("id").isInt()], "Invalid order id"), validate],
  getOrder
);

router.patch(
  "/:id/status",
  [
    oneOf([param("id").isUUID(), param("id").isInt()], "Invalid order id"),
    body("status").isIn(["pending", "processing", "completed", "cancelled"]),
    validate,
  ],
  updateOrderStatus
);

router.patch(
  "/:id/payment",
  [
    oneOf([param("id").isUUID(), param("id").isInt()], "Invalid order id"),
    body("payment_status").isIn(["paid", "unpaid"]),
    validate,
  ],
  updatePaymentStatus
);

module.exports = router;
