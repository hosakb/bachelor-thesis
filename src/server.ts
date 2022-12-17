import express from "express";
import expressLayouts from "express-ejs-layouts";
import passport from "passport";
import flash from "express-flash";
import session from "express-session";

import initializePassport from "./config/passport";

import indexRouter from "./routes/index";
import submitRouter from "./routes/submit";
import fundDashboardRouter from "./routes/fund";
import startupDashboardRouter from "./routes/startup";
import adminRouter from "./routes/admin";
import onboardingRouter from "./routes/onboarding";
import { checkNotAuthenticated } from "./middleware/check-auth";

const app = express();

initializePassport(passport);

app.use(
  session({
    // Key we want to keep secret which will encrypt all of our information
    secret: "12345",
    // Should we resave our session variables if nothing has changes which we dont
    resave: true,
    // Save empty value if there is no vaue which we do not want to do
    saveUninitialized: false,
  })
);

// Funtion inside passport which initializes passport
app.use(passport.initialize());

// Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport.session());
app.use(flash());

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/login");
app.use(expressLayouts);

app.use(express.static(__dirname + "/public"));
// app.use("/css", express.static(__dirname + "/public/css"));
// app.use("/js", express.static(__dirname + "/public/js"));
// app.use("/node-modules", express.static(__dirname + "/../node_modules"));
// app.use("/img", express.static(__dirname + "/public/img"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", indexRouter);

app.use(checkNotAuthenticated);

app.use("/submit", submitRouter);
app.use("/fund", fundDashboardRouter);
app.use("/admin", adminRouter);
app.use("/startup", startupDashboardRouter);
app.use("/onboarding", onboardingRouter);

app.listen(process.env.PORT || 3000);
