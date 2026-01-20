const express = require("express");
const { body, param, query } = require("express-validator");
const {
  createOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
} = require("../controllers/orders.controller");
const { authenticate } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

const router = express.Router();

router.use(authenticate);

router.post(
  "/",
  [
    body("customer_id").isInt(),
    body("items").isArray({ min: 1 }),
    body("items.*.product_id").isInt(),
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
  [param("id").isInt(), validate],
  getOrder
);

router.patch(
  "/:id/status",
  [
    param("id").isInt(),
    body("status").isIn(["pending", "processing", "completed", "cancelled"]),
    validate,
  ],
  updateOrderStatus
);

module.exports = router;
