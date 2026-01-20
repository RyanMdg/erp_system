const express = require("express");
const { body, param, query, oneOf } = require("express-validator");
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/products.controller");
const { authenticate, requireRole } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  [
    query("search").optional().isString(),
    query("status").optional().isString(),
    query("page").optional().isInt({ min: 1 }),
    query("pageSize").optional().isInt({ min: 1, max: 100 }),
    validate,
  ],
  listProducts
);

router.get(
  "/:id",
  [
    oneOf([param("id").isUUID(), param("id").isInt()], "Invalid product id"),
    validate,
  ],
  getProduct
);

router.post(
  "/",
  [
    requireRole("admin", "manager"),
    body("name").trim().notEmpty(),
    body("sku").trim().notEmpty(),
    body("category").optional().isString(),
    body("price").isFloat({ min: 0 }),
    body("stock_quantity").optional().isInt({ min: 0 }),
    validate,
  ],
  createProduct
);

router.put(
  "/:id",
  [
    oneOf([param("id").isUUID(), param("id").isInt()], "Invalid product id"),
    body("name").trim().notEmpty(),
    body("sku").trim().notEmpty(),
    body("category").optional().isString(),
    body("price").isFloat({ min: 0 }),
    body("stock_quantity").isInt({ min: 0 }),
    body("status").isString(),
    validate,
  ],
  updateProduct
);

router.delete(
  "/:id",
  [
    oneOf([param("id").isUUID(), param("id").isInt()], "Invalid product id"),
    validate,
  ],
  deleteProduct
);

module.exports = router;
