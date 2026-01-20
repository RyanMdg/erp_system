const { pool, query } = require("../db");
const { sendSuccess, sendError } = require("../utils/response");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");
const asyncHandler = require("../utils/asyncHandler");
const { getColumns } = require("../utils/schema");

const TAX_RATE = parseFloat(process.env.TAX_RATE || "0");

const resolveOrderTotalExpression = (columns, alias = "o") => {
  if (columns.has("total")) return `${alias}.total`;
  if (columns.has("total_amount")) return `${alias}.total_amount`;
  if (columns.has("grand_total")) return `${alias}.grand_total`;
  if (columns.has("amount")) return `${alias}.amount`;
  if (columns.has("subtotal") && columns.has("tax")) {
    return `${alias}.subtotal + ${alias}.tax`;
  }
  if (columns.has("subtotal")) return `${alias}.subtotal`;
  return "0";
};

const createOrder = asyncHandler(async (req, res) => {
  const { customer_id, items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return sendError(res, 400, "Order must include at least one item");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const preparedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const { product_id, quantity, unit_price } = item;

      const productResult = await client.query(
        `SELECT id, name, price, stock_quantity
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

      const product = productResult.rows[0];
      if (product.stock_quantity < quantity) {
        const error = new Error(
          `Insufficient stock for product ${product.name}`
        );
        error.status = 400;
        throw error;
      }

      const resolvedUnitPrice =
        unit_price !== undefined && unit_price !== null
          ? Number(unit_price)
          : Number(product.price);
      const lineTotal = resolvedUnitPrice * quantity;
      subtotal += lineTotal;

      preparedItems.push({
        product_id,
        quantity,
        unit_price: resolvedUnitPrice,
        line_total: lineTotal,
      });
    }

    const tax = Number((subtotal * TAX_RATE).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    const orderColumns = await getColumns("orders");
    const insertColumns = ["customer_id"];
    const insertValues = [customer_id];
    const valuePlaceholders = ["$1"];
    let idx = 2;

    if (orderColumns.has("status")) {
      insertColumns.push("status");
      insertValues.push("pending");
      valuePlaceholders.push(`$${idx}`);
      idx += 1;
    }
    if (orderColumns.has("subtotal")) {
      insertColumns.push("subtotal");
      insertValues.push(subtotal);
      valuePlaceholders.push(`$${idx}`);
      idx += 1;
    }
    if (orderColumns.has("tax")) {
      insertColumns.push("tax");
      insertValues.push(tax);
      valuePlaceholders.push(`$${idx}`);
      idx += 1;
    }
    if (orderColumns.has("total")) {
      insertColumns.push("total");
      insertValues.push(total);
      valuePlaceholders.push(`$${idx}`);
      idx += 1;
    } else if (orderColumns.has("total_amount")) {
      insertColumns.push("total_amount");
      insertValues.push(total);
      valuePlaceholders.push(`$${idx}`);
      idx += 1;
    } else if (orderColumns.has("grand_total")) {
      insertColumns.push("grand_total");
      insertValues.push(total);
      valuePlaceholders.push(`$${idx}`);
      idx += 1;
    } else if (orderColumns.has("amount")) {
      insertColumns.push("amount");
      insertValues.push(total);
      valuePlaceholders.push(`$${idx}`);
      idx += 1;
    }

    const orderTotalExpr = resolveOrderTotalExpression(orderColumns, "o");
    const orderResult = await client.query(
      `INSERT INTO orders (${insertColumns.join(", ")})
       VALUES (${valuePlaceholders.join(", ")})
       RETURNING id, customer_id, status, subtotal, tax, ${orderTotalExpr} AS total, created_at`,
      insertValues
    );

    const order = orderResult.rows[0];

    for (const item of preparedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          order.id,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.line_total,
        ]
      );

      await client.query(
        `UPDATE products
         SET stock_quantity = stock_quantity - $1
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );

      const movementColumns = await getColumns("inventory_movements");
      if (movementColumns.has("user_id")) {
        await client.query(
          `INSERT INTO inventory_movements
            (product_id, movement_type, quantity, reference, user_id)
           VALUES ($1, 'sale', $2, $3, $4)`,
          [item.product_id, item.quantity, `order:${order.id}`, req.user.id]
        );
      } else {
        await client.query(
          `INSERT INTO inventory_movements
            (product_id, movement_type, quantity, reference)
           VALUES ($1, 'sale', $2, $3)`,
          [item.product_id, item.quantity, `order:${order.id}`]
        );
      }
    }

    await client.query("COMMIT");

    return sendSuccess(
      res,
      { order, items: preparedItems },
      "Order created",
      201
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

const listOrders = asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = getPagination(req.query);

  const countResult = await query(
    "SELECT COUNT(*)::int AS count FROM orders",
    []
  );

  const orderColumns = await getColumns("orders");
  const orderTotalExpr = resolveOrderTotalExpression(orderColumns, "o");

  const listResult = await query(
    `SELECT o.id, o.customer_id, o.status, ${orderTotalExpr} AS total, o.created_at,
            c.name AS customer_name, c.contact_email AS customer_email
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     ORDER BY o.created_at DESC
     LIMIT $1 OFFSET $2`,
    [pageSize, offset]
  );

  const totalItems = countResult.rows[0]?.count || 0;
  const meta = buildPaginationMeta(totalItems, page, pageSize);

  return sendSuccess(res, { items: listResult.rows, meta });
});

const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const orderColumns = await getColumns("orders");
  const orderTotalExpr = resolveOrderTotalExpression(orderColumns, "o");
  const orderResult = await query(
    `SELECT o.id, o.customer_id, o.status, o.subtotal, o.tax, ${orderTotalExpr} AS total, o.created_at,
            c.name AS customer_name, c.contact_email AS customer_email
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     WHERE o.id = $1`,
    [id]
  );

  if (!orderResult.rows.length) {
    return sendError(res, 404, "Order not found");
  }

  const itemsResult = await query(
    `SELECT oi.product_id, oi.quantity, oi.unit_price, oi.total_price,
            p.name AS product_name, p.sku
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1`,
    [id]
  );

  return sendSuccess(res, {
    order: orderResult.rows[0],
    items: itemsResult.rows,
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const result = await query(
    `UPDATE orders
     SET status = $1
     WHERE id = $2
     RETURNING id, customer_id, status, subtotal, tax, total, created_at`,
    [status, id]
  );

  if (!result.rows.length) {
    return sendError(res, 404, "Order not found");
  }

  return sendSuccess(res, result.rows[0], "Order status updated");
});

module.exports = {
  createOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
};
