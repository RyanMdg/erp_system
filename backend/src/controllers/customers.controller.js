const { query } = require("../db");
const { sendSuccess, sendError } = require("../utils/response");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");
const asyncHandler = require("../utils/asyncHandler");

const listCustomers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const { page, pageSize, offset } = getPagination(req.query);

  const params = [];
  const where = ["is_active = true"];

  if (search) {
    params.push(`%${search}%`);
    where.push(`(name ILIKE $${params.length} OR contact_email ILIKE $${params.length})`);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const countResult = await query(
    `SELECT COUNT(*)::int AS count FROM customers ${whereClause}`,
    params
  );

  params.push(pageSize, offset);
  const listResult = await query(
    `SELECT id, name, contact_email, contact_phone, city, country, is_active, created_at
     FROM customers
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const totalItems = countResult.rows[0]?.count || 0;
  const meta = buildPaginationMeta(totalItems, page, pageSize);

  return sendSuccess(res, { items: listResult.rows, meta });
});

const getCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    `SELECT id, name, contact_email, contact_phone, city, country, is_active, created_at
     FROM customers
     WHERE id = $1`,
    [id]
  );

  if (!result.rows.length) {
    return sendError(res, 404, "Customer not found");
  }

  return sendSuccess(res, result.rows[0]);
});

const createCustomer = asyncHandler(async (req, res) => {
  const { name, contact_email, contact_phone, city, country } = req.body;

  const result = await query(
    `INSERT INTO customers (name, contact_email, contact_phone, city, country, is_active)
     VALUES ($1, $2, $3, $4, $5, true)
     RETURNING id, name, contact_email, contact_phone, city, country, is_active, created_at`,
    [name, contact_email, contact_phone, city, country]
  );

  return sendSuccess(res, result.rows[0], "Customer created", 201);
});

const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, contact_email, contact_phone, city, country } = req.body;

  const result = await query(
    `UPDATE customers
     SET name = $1,
         contact_email = $2,
         contact_phone = $3,
         city = $4,
         country = $5
     WHERE id = $6
     RETURNING id, name, contact_email, contact_phone, city, country, is_active, created_at`,
    [name, contact_email, contact_phone, city, country, id]
  );

  if (!result.rows.length) {
    return sendError(res, 404, "Customer not found");
  }

  return sendSuccess(res, result.rows[0], "Customer updated");
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    `UPDATE customers
     SET is_active = false
     WHERE id = $1
     RETURNING id`,
    [id]
  );

  if (!result.rows.length) {
    return sendError(res, 404, "Customer not found");
  }

  return sendSuccess(res, { id }, "Customer deactivated");
});

module.exports = {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
