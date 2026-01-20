const express = require("express");
const { body, query } = require("express-validator");
const {
  adjustInventory,
  listMovements,
  inventorySummary,
} = require("../controllers/inventory.controller");
const { authenticate, requireRole } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

const router = express.Router();

router.use(authenticate);

router.post(
  "/adjust",
  [
    requireRole("admin", "manager"),
    body("product_id").isInt(),
    body("movement_type").isIn(["stock_in", "stock_out", "adjustment"]),
    body("quantity").isInt({ min: 1 }),
    body("location").optional().isString(),
    body("reference").optional().isString(),
    validate,
  ],
  adjustInventory
);

router.get(
  "/movements",
  [
    query("product_id").optional().isInt(),
    query("type").optional().isString(),
    query("page").optional().isInt({ min: 1 }),
    query("pageSize").optional().isInt({ min: 1, max: 100 }),
    validate,
  ],
  listMovements
);

router.get("/summary", inventorySummary);

module.exports = router;
