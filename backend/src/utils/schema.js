const { query } = require("../db");

const cache = new Map();

const getColumns = async (tableName) => {
  const key = `columns:${tableName}`;
  if (cache.has(key)) {
    return cache.get(key);
  }

  const result = await query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_name = $1`,
    [tableName]
  );

  const columns = new Set(result.rows.map((row) => row.column_name));
  cache.set(key, columns);
  return columns;
};

const hasColumn = async (tableName, columnName) => {
  const columns = await getColumns(tableName);
  return columns.has(columnName);
};

module.exports = {
  getColumns,
  hasColumn,
};
