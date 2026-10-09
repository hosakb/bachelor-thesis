import express, { Router, Response, Request } from "express";
import { checkAuthenticated } from "../middleware/check-auth";
import passport from "passport";
import { randomBytes } from "crypto";

import {
  Role,
  User,
  UserRole,
  getUserRole,
  getFirstUserLoginByEmail,
  getLoginUserByEmail,
} from "../models/users";
import {
  getFirstStartupLoginById,
  getQuestionnaireFilledOut,
} from "../models/startup";

import { getTrlAvailable } from "../models/trl";

const router: Router = express.Router();

router.get("/", checkAuthenticated, (req, res) => {
  const localDemo = Boolean(req.app.locals.demoAccounts);
  if (localDemo) req.session.demoLoginToken = randomBytes(32).toString("hex");
  res.render("index", {
    layout: "../views/layouts/login.ejs",
    localDemo,
    demoLoginToken: localDemo ? req.session.demoLoginToken : undefined,
  });
});

// Only the isolated launcher supplies this server-owned fixture map.
router.post("/demo/login", async (req, res, next) => {
  const accounts = req.app.locals.demoAccounts;
  if (!accounts) return res.sendStatus(404);
  const origin = req.get("Origin");
  if (
    (origin && origin !== `${req.protocol}://${req.get("host")}`) ||
    typeof req.body.token !== "string" ||
    !req.session.demoLoginToken ||
    req.body.token !== req.session.demoLoginToken
  )
    return res.status(403).send("Reload the role picker and try again.");
  const role = req.body.role;
  if (
    typeof role !== "string" ||
    !Object.prototype.hasOwnProperty.call(accounts, role) ||
    Object.keys(req.body).some((key) => key !== "role" && key !== "token")
  )
    return res.sendStatus(400);
  try {
    const fixture = await getLoginUserByEmail(accounts[role]);
    if (fixture.role !== role) return res.sendStatus(400);
    const user: User = {
      id: fixture.id,
      firstName: fixture.firstName,
      lastName: fixture.lastName,
      email: fixture.email,
      role: fixture.role,
      created_at: fixture.created_at,
      updated_at: fixture.updated_at,
      startup: fixture.startup,
      fund: fixture.fund,
    };
    delete req.session.demoLoginToken;
    req.logIn(user, async (error) => {
      if (error) return next(error);
      try {
        const userRole = await getUserRole(user.email);
        if (userRole.role === Role.Admin) return loginAdmin(userRole, res);
        if (userRole.role === Role.Startup)
          return await loginOrOnboardStartupUser(
            userRole,
            user.email,
            res,
            req
          );
        return loginFund(userRole, req, res);
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/",
    failureFlash: true,
  }),
  async (req, res) => {
    const { email } = req.body;
    try {
      const userRole: UserRole = await getUserRole(email);
      switch (userRole.role) {
        case Role.Admin:
          return loginAdmin(userRole, res);
        case Role.Startup:
          return loginOrOnboardStartupUser(userRole, email, res, req);
        case Role.Fund:
          return loginFund(userRole, req, res);
        case Role.Stakeholder:
          return loginFund(userRole, req, res);
        default:
          throw new Error("No role assigned to user.");
      }
    } catch (error) {
      console.info(error + " Redirecting to login page.");
      return res.redirect("/");
    }
  }
);

router.get("/logout", (req, res, next) => {
  req.logout({ keepSessionInfo: false }, (err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

export default router;

function loginFund(userRole: UserRole, req: Request, res: Response) {
  console.info(
    `Logged in as fund with id ${userRole.id} and redirected to /fund/${userRole.id}`
  );
  req.session.fundId = userRole.id;
  return res.redirect("/fund");
}

function loginAdmin(userRole: UserRole, res: Response) {
  console.info(
    `Logged in as admin with id
          ${userRole.id}
            and redirected to /admin/`
  );
  return res.redirect("/admin");
}

async function loginOrOnboardStartupUser(
  userRole: UserRole,
  email: string,
  res: Response,
  req: Request
) {
  try {
    if (await getFirstStartupLoginById(userRole.id)) {
      console.info(
        `First login as startup with id ${userRole.id} and redirected to /onboarding/startup due to first login.}`
      );
      return res.redirect("/onboarding/startup");
    }

    if (!(await getTrlAvailable(userRole.id))) {
      console.info(
        `TRL information missing for startup with id ${userRole.id}. Redirecting to /onboarding/product due to first login.}`
      );
      return res.redirect("/onboarding/product");
    }

    if (!(await getQuestionnaireFilledOut(userRole.id))) {
      console.info(
        `Rating information missing for startup with id ${userRole.id}. Redirecting to /onboarding/questionnaire due to first login.}`
      );
      return res.redirect("/onboarding/questionnaire");
    }

    req.session.startupId = userRole.id;

    if (await getFirstUserLoginByEmail(email)) {
      console.info(
        `First login as user with id ${userRole.id} and redirected to /onboarding/ due to first login.}`
      );
      return res.redirect("/onboarding/track-record");
    }

    console.info(
      `Logged in as startup with id ${userRole.id} and redirected to /startup/${userRole.id}`
    );
    return res.redirect("/startup");
  } catch (error) {
    throw new Error(
      `Failed to query first login attempt from db due to ${error}.`
    );
  }
}
