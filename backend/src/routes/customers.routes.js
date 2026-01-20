const express = require("express");
const { body, param, query, oneOf } = require("express-validator");
const {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customers.controller");
const { authenticate, requireRole } = require("../middlewares/auth");
const validate = require("../middlewares/validate");

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  [
    query("search").optional().isString(),
    query("page").optional().isInt({ min: 1 }),
    query("pageSize").optional().isInt({ min: 1, max: 100 }),
    validate,
  ],
  listCustomers
);

router.get(
  "/:id",
  [
    oneOf([param("id").isUUID(), param("id").isInt()], "Invalid customer id"),
    validate,
  ],
  getCustomer
);

router.post(
  "/",
  [
    requireRole("admin", "manager"),
    body("name").trim().notEmpty(),
    body("contact_email").optional().isEmail(),
    body("contact_phone").optional().isString(),
    body("city").optional().isString(),
    body("country").optional().isString(),
    validate,
  ],
  createCustomer
);

router.put(
  "/:id",
  [
    oneOf([param("id").isUUID(), param("id").isInt()], "Invalid customer id"),
    body("name").trim().notEmpty(),
    body("contact_email").optional().isEmail(),
    body("contact_phone").optional().isString(),
    body("city").optional().isString(),
    body("country").optional().isString(),
    validate,
  ],
  updateCustomer
);

router.delete(
  "/:id",
  [
    oneOf([param("id").isUUID(), param("id").isInt()], "Invalid customer id"),
    validate,
  ],
  deleteCustomer
);

module.exports = router;
