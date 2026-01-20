const { pool, query } = require("../db");
const { sendSuccess, sendError } = require("../utils/response");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");
const asyncHandler = require("../utils/asyncHandler");
const { hasColumn, getColumns } = require("../utils/schema");

const adjustInventory = asyncHandler(async (req, res) => {
  const { product_id, movement_type, quantity, location, reference } = req.body;

  const delta =
    movement_type === "stock_in"
      ? quantity
      : movement_type === "stock_out"
      ? -quantity
      : Number(quantity);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const productResult = await client.query(
      `SELECT id, stock_quantity
       FROM products
       WHERE id = $1 AND is_active = true
       FOR UPDATE`,
      [product_id]
    );

    if (!productResult.rows.length) {
      const error = new Error("Product not found");
      error.status = 404;
      throw error;
    }

    const currentStock = Number(productResult.rows[0].stock_quantity);
    const newStock = currentStock + delta;

    if (newStock < 0) {
      const error = new Error("Insufficient stock for adjustment");
      error.status = 400;
      throw error;
    }

    const hasUserId = await hasColumn("inventory_movements", "user_id");
    const hasCreatedBy = await hasColumn("inventory_movements", "created_by");

    if (hasUserId) {
      await client.query(
        `INSERT INTO inventory_movements
          (product_id, movement_type, quantity, location, reference, user_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          product_id,
          movement_type,
          quantity,
          location || null,
          reference || null,
          req.user.id,
        ]
      );
    } else if (hasCreatedBy) {
      await client.query(
        `INSERT INTO inventory_movements
          (product_id, movement_type, quantity, location, reference, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          product_id,
          movement_type,
          quantity,
          location || null,
          reference || null,
          req.user.id,
        ]
      );
    } else {
      await client.query(
        `INSERT INTO inventory_movements
          (product_id, movement_type, quantity, location, reference)
         VALUES ($1, $2, $3, $4, $5)`,
        [product_id, movement_type, quantity, location || null, reference || null]
      );
    }

    await client.query(
      `UPDATE products
       SET stock_quantity = $1
       WHERE id = $2`,
      [newStock, product_id]
    );

    await client.query("COMMIT");

    return sendSuccess(
      res,
      { product_id, stock_quantity: newStock },
      "Inventory adjusted"
    );
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.status) {
      return sendError(res, error.status, error.message);
    }
    throw error;
  } finally {
    client.release();
  }
});

const listMovements = asyncHandler(async (req, res) => {
  const { product_id, type } = req.query;
  const { page, pageSize, offset } = getPagination(req.query);

  const params = [];
  const where = [];

  if (product_id) {
    params.push(product_id);
    where.push(`im.product_id = $${params.length}`);
  }

  if (type) {
    params.push(type);
    where.push(`im.movement_type = $${params.length}`);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const countResult = await query(
    `SELECT COUNT(*)::int AS count
     FROM inventory_movements im
     ${whereClause}`,
    params
  );

  const columns = await getColumns("inventory_movements");
  const hasUserId = columns.has("user_id");
  const hasCreatedBy = columns.has("created_by");
  const userJoin = hasUserId
    ? "LEFT JOIN users u ON u.id = im.user_id"
    : hasCreatedBy
    ? "LEFT JOIN users u ON u.id = im.created_by"
    : "";

  params.push(pageSize, offset);
  const listResult = await query(
    `SELECT im.id, im.product_id, im.movement_type, im.quantity, im.location, im.reference,
            im.created_at, p.name AS product_name,
            ${hasUserId || hasCreatedBy ? "u.full_name" : "NULL"} AS user_name
     FROM inventory_movements im
     JOIN products p ON p.id = im.product_id
     ${userJoin}
     ${whereClause}
     ORDER BY im.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const totalItems = countResult.rows[0]?.count || 0;
  const meta = buildPaginationMeta(totalItems, page, pageSize);

  return sendSuccess(res, { items: listResult.rows, meta });
});

const inventorySummary = asyncHandler(async (_req, res) => {
  const result = await query(
    `SELECT
       COALESCE(SUM(CASE WHEN movement_type = 'stock_in' THEN quantity END), 0) AS total_received,
       COALESCE(SUM(CASE WHEN movement_type IN ('stock_out', 'sale') THEN quantity END), 0) AS total_dispatched,
       COALESCE(SUM(CASE WHEN movement_type = 'adjustment' THEN quantity END), 0) AS total_adjusted
     FROM inventory_movements`,
    []
  );

  const totals = result.rows[0] || {
    total_received: 0,
    total_dispatched: 0,
    total_adjusted: 0,
  };

  const netChange =
    Number(totals.total_received) -
    Number(totals.total_dispatched) +
    Number(totals.total_adjusted);

  return sendSuccess(res, {
    ...totals,
    net_change: netChange,
  });
});

module.exports = {
  adjustInventory,
  listMovements,
  inventorySummary,
};
