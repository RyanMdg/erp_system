const express = require("express");
const { body } = require("express-validator");
const { register, login } = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");

const router = express.Router();

router.post(
  "/register",
  [
    body("full_name").trim().notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("role").optional().isIn(["admin", "manager", "staff"]),
    validate,
  ],
  register
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty(), validate],
  login
);

module.exports = router;
