import express, { Express, Request, Response, Router } from "express";
import expressLayouts from "express-ejs-layouts";
import passport from "passport";
import flash from "express-flash";
import session from "express-session";

import initializePassport from "./config/passport";
const { pool } = require("./db/config");

const app = express();

initializePassport(passport);

app.use(
  session({
    // Key we want to keep secret which will encrypt all of our information
    secret: "12345",
    // Should we resave our session variables if nothing has changes which we dont
    resave: false,
    // Save empty value if there is no vaue which we do not want to do
    saveUninitialized: false,
  })
);

// Funtion inside passport which initializes passport
app.use(passport.initialize());

// Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport.session());
app.use(flash());

const indexRouter = require("./routes/index");
const submitRouter = require("./routes/submit");
const dashboardRouter = require("./routes/dashboard");
const adminRouter = require("./routes/admin");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);

app.use(express.static("public"));
app.use("/css", express.static(__dirname + "public/css"));
app.use("/js", express.static(__dirname + "public/js"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", indexRouter);
app.use("/submit", submitRouter);
app.use("/dashboard", dashboardRouter);
app.use("/admin", adminRouter);

app.listen(process.env.PORT || 3000);
