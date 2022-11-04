import { Pool } from "pg";

require("dotenv").config();

const isProd = process.env.NODE_ENV === "production";

const connStr = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

console.log("Created connection string.");

export default new Pool({
  connectionString: isProd ? process.env.PGURL : connStr,
});
