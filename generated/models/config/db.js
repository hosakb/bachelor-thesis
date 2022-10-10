"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}
const pool = new pg_1.Pool();
pool.connect();
pool.on('connect', () => {
    console.log("Connected to Postgres");
});
module.exports = {
    query: (text, params) => {
        return pool.query(text, params);
    },
};
