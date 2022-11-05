"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
require("dotenv").config();
const isProd = process.env.NODE_ENV === "production";
const connStr = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
const pool = new pg_1.Pool({
  connectionString: isProd ? process.env.PGURL : connStr,
});
module.exports = { pool };
