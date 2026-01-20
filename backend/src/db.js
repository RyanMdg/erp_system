const { Pool } = require("pg");

const normalizeDatabaseUrl = (value) => {
  if (!value) return value;
  let url = value.trim();
  if (url.startsWith("psql ")) {
    url = url.slice(5).trim();
  }
  if (
    (url.startsWith("'") && url.endsWith("'")) ||
    (url.startsWith('"') && url.endsWith('"'))
  ) {
    url = url.slice(1, -1);
  }
  return url;
};

const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

if (!databaseUrl) {
  // eslint-disable-next-line no-console
  console.error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString: databaseUrl,
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
