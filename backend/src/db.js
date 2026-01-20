const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.PGSSLMODE === "disable"
      ? false
      : { rejectUnauthorized: false },
});

const query = (text, params) => pool.query(text, params);

module.exports = {
  pool,
  query,
};
