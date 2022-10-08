if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const { Pool } = require("pg");

const pool = new Pool();

pool.on('connect', () => {
  console.log("Connected to Postgres");
});

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
}