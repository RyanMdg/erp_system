const { query } = require("../db");
const { sendSuccess, sendError } = require("../utils/response");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");
const asyncHandler = require("../utils/asyncHandler");

const listProducts = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const { page, pageSize, offset } = getPagination(req.query);

  const params = [];
  const where = ["is_active = true"];

  if (search) {
    params.push(`%${search}%`);
    where.push(`(name ILIKE $${params.length} OR sku ILIKE $${params.length})`);
  }

  if (status) {
    params.push(status);
    where.push(`status = $${params.length}`);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const countResult = await query(
    `SELECT COUNT(*)::int AS count FROM products ${whereClause}`,
    params
  );

  params.push(pageSize, offset);
  const listResult = await query(
    `SELECT id, name, sku, category, price, stock_quantity, status, is_active, created_at
     FROM products
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const totalItems = countResult.rows[0]?.count || 0;
  const meta = buildPaginationMeta(totalItems, page, pageSize);

  return sendSuccess(res, { items: listResult.rows, meta });
});

const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    `SELECT id, name, sku, category, price, stock_quantity, status, is_active, created_at
     FROM products
     WHERE id = $1`,
    [id]
  );

  if (!result.rows.length) {
    return sendError(res, 404, "Product not found");
  }

  return sendSuccess(res, result.rows[0]);
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, price, stock_quantity } = req.body;
  const initialStock = stock_quantity ?? 0;

  const result = await query(
    `INSERT INTO products (name, sku, category, price, stock_quantity, is_active)
     VALUES ($1, $2, $3, $4, $5, true)
     RETURNING id, name, sku, category, price, stock_quantity, status, is_active, created_at`,
    [name, sku, category, price, initialStock]
  );

  return sendSuccess(res, result.rows[0], "Product created", 201);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, sku, category, price, stock_quantity, status } = req.body;

  const result = await query(
    `UPDATE products
     SET name = $1,
         sku = $2,
         category = $3,
         price = $4,
         stock_quantity = $5,
         status = $6
     WHERE id = $7
     RETURNING id, name, sku, category, price, stock_quantity, status, is_active, created_at`,
    [name, sku, category, price, stock_quantity, status, id]
  );

  if (!result.rows.length) {
    return sendError(res, 404, "Product not found");
  }

  return sendSuccess(res, result.rows[0], "Product updated");
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    `UPDATE products
     SET is_active = false
     WHERE id = $1
     RETURNING id`,
    [id]
  );

  if (!result.rows.length) {
    return sendError(res, 404, "Product not found");
  }

  return sendSuccess(res, { id }, "Product deactivated");
});

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
