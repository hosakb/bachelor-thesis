const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");

const indexRouter = require("./routes/index");
const submitRouter = require("./routes/submit");
const dashboardRouter = require("./routes/dashboard");
const adminRouter = require("./routes/admin");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(express.static("public"));
// app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", indexRouter);
app.use("/submit", submitRouter);
app.use("/dashboard", dashboardRouter);
app.use("/admin", adminRouter);

app.listen(process.env.PORT || 3000);
