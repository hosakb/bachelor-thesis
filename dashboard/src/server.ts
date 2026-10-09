import express from "express";
import expressLayouts from "express-ejs-layouts";
import passport from "passport";
import flash from "express-flash";
import session from "express-session";
import favicon from "serve-favicon";

import initializePassport from "./config/passport";

import indexRouter from "./routes/index";
import investorDashboardRouter from "./routes/investor";
import startupDashboardRouter from "./routes/startup";
import adminRouter from "./routes/admin";
import onboardingRouter from "./routes/onboarding";
import { checkNotAuthenticated, requireRole } from "./middleware/check-auth";
import { errorHandler, forwardAsyncErrors } from "./middleware/async-errors";
import path from "path";

const app = express();

app.use(favicon(path.join(__dirname, "..", "public", "favicon.ico")));

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

app.use(express.static(path.join(__dirname, "../public")));
// Serve the Line Awesome icon fonts from the installed package so the local
// /css/line-awesome.min.css (which references ../fonts/) works offline.
app.use(
  "/fonts",
  express.static(
    path.join(
      path.dirname(require.resolve("line-awesome/package.json")),
      "dist/line-awesome/fonts"
    )
  )
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", forwardAsyncErrors(indexRouter));

app.use(checkNotAuthenticated);

app.use(
  "/fund",
  requireRole("fund", "stakeholder"),
  forwardAsyncErrors(investorDashboardRouter)
);
app.use("/admin", requireRole("admin"), forwardAsyncErrors(adminRouter));
app.use(
  "/startup",
  requireRole("startup"),
  forwardAsyncErrors(startupDashboardRouter)
);
app.use(
  "/onboarding",
  requireRole("startup"),
  forwardAsyncErrors(onboardingRouter)
);

app.use(errorHandler);

export default app;

if (require.main === module) {
  app.listen(process.env.PORT || 3000);
}
