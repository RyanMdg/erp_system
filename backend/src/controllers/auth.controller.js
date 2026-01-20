const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { query } = require("../db");
const { sendSuccess, sendError } = require("../utils/response");
const asyncHandler = require("../utils/asyncHandler");

let roleColumnExistsPromise;

const hasRoleColumn = () => {
  if (!roleColumnExistsPromise) {
    roleColumnExistsPromise = query(
      `SELECT 1
       FROM information_schema.columns
       WHERE table_name = 'users' AND column_name = 'role'
       LIMIT 1`,
      []
    ).then((result) => result.rows.length > 0);
  }
  return roleColumnExistsPromise;
};

const register = asyncHandler(async (req, res) => {
  const { full_name, email, password, role } = req.body;

  const existing = await query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (existing.rows.length) {
    return sendError(res, 409, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userRole = role || "admin";
  const roleColumnExists = await hasRoleColumn();

  if (roleColumnExists) {
    const result = await query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role`,
      [full_name, email, passwordHash, userRole]
    );

    return sendSuccess(res, result.rows[0], "User registered", 201);
  }

  const result = await query(
    `INSERT INTO users (full_name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, full_name, email`,
    [full_name, email, passwordHash]
  );

  return sendSuccess(
    res,
    { ...result.rows[0], role: userRole },
    "User registered",
    201
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const roleColumnExists = await hasRoleColumn();
  const result = await query(
    roleColumnExists
      ? `SELECT id, full_name, email, role, password_hash
         FROM users
         WHERE email = $1`
      : `SELECT id, full_name, email, password_hash
         FROM users
         WHERE email = $1`,
    [email]
  );

  if (!result.rows.length) {
    return sendError(res, 401, "Invalid credentials");
  }

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    return sendError(res, 401, "Invalid credentials");
  }

  const payload = {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: roleColumnExists ? user.role : "admin",
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

  return sendSuccess(res, { token, user: payload }, "Login successful");
});

module.exports = {
  register,
  login,
};
