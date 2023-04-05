import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connStr = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

console.log("Created connection string.");

export default new Pool({
  connectionString: connStr,
});
