if (process.env.NODE_ENV != 'production') {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");

const indexRouter = require("./routes/index");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(express.static("public"));

const {Pool, Client} = require('pg');
const pool = new Pool();

pool.on('open', error => console.log('Connected to Postgres'));

app.use("/", indexRouter);

app.listen(process.env.PORT || 3000);
