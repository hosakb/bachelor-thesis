import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";

// const connStr = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;
const connStr = `postgresql://postgres:postgres@localhost:5433/dashboard`;

export default new Pool({
  connectionString: isProd ? process.env.PGURL : connStr,
});

