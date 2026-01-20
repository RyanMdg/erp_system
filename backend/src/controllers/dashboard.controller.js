const { query } = require("../db");
const { sendSuccess } = require("../utils/response");
const asyncHandler = require("../utils/asyncHandler");
const { getColumns } = require("../utils/schema");

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

const dashboardSummary = asyncHandler(async (_req, res) => {
  const orderColumns = await getColumns("orders");
  const orderTotalExpr = resolveOrderTotalExpression(orderColumns);

  const [
    customersResult,
    productsResult,
    ordersTodayResult,
    stockResult,
    recentOrdersResult,
    topProductsResult,
  ] = await Promise.all([
    query("SELECT COUNT(*)::int AS count FROM customers WHERE is_active = true"),
    query("SELECT COUNT(*)::int AS count FROM products WHERE is_active = true"),
    query(
      "SELECT COUNT(*)::int AS count FROM orders WHERE created_at::date = CURRENT_DATE"
    ),
    query(
      "SELECT COALESCE(SUM(stock_quantity), 0)::int AS total FROM products"
    ),
    query(
      `SELECT o.id, ${orderTotalExpr} AS total, o.status, o.created_at,
              c.name AS customer_name
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       ORDER BY o.created_at DESC
       LIMIT 5`
    ),
    query(
      `SELECT p.id, p.name, p.sku, COALESCE(SUM(oi.quantity), 0)::int AS total_sold
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       GROUP BY p.id, p.name, p.sku
       ORDER BY total_sold DESC
       LIMIT 5`
    ),
  ]);

  return sendSuccess(res, {
    total_customers: customersResult.rows[0]?.count || 0,
    total_products: productsResult.rows[0]?.count || 0,
    orders_today: ordersTodayResult.rows[0]?.count || 0,
    stock_items: stockResult.rows[0]?.total || 0,
    recent_orders: recentOrdersResult.rows,
    top_products: topProductsResult.rows,
  });
});

module.exports = {
  dashboardSummary,
};
