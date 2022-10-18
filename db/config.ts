import { Pool } from "pg";

require("dotenv").config();

const isProd = process.env.NODE_ENV === "production";

const connStr = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;

const pool: Pool = new Pool({
  connectionString: isProd ? process.env.PGURL : connStr,
});

module.exports = { pool };
