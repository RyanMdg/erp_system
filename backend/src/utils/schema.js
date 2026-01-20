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

const getColumnInfo = async (tableName) => {
  const key = `columnInfo:${tableName}`;
  if (cache.has(key)) {
    return cache.get(key);
  }

  const result = await query(
    `SELECT column_name, is_generated, generation_expression, column_default
     FROM information_schema.columns
     WHERE table_name = $1`,
    [tableName]
  );

  const info = new Map(
    result.rows.map((row) => [
      row.column_name,
      {
        is_generated: row.is_generated,
        generation_expression: row.generation_expression,
        column_default: row.column_default,
      },
    ])
  );

  cache.set(key, info);
  return info;
};

const hasColumn = async (tableName, columnName) => {
  const columns = await getColumns(tableName);
  return columns.has(columnName);
};

module.exports = {
  getColumns,
  getColumnInfo,
  hasColumn,
};
