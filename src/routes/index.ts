import express, { Router, Response, Request } from "express";
import { checkAuthenticated } from "../middleware/check-auth";
import passport from "passport";

import {
  Role,
  UserRole,
  getUserRole,
  getFirstUserLoginByEmail,
} from "../models/users";
import {
  getFirstStartupLoginById,
  getTrlAvailable,
  getQuestionnaireFilledOut,
} from "../models/startup";

const router: Router = express.Router();

router.get("/", checkAuthenticated, (req, res) => {
  res.render("index", { layout: "../views/layouts/login.ejs" });
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

router.get("/logout", (req, res) => {
  req.logout({ keepSessionInfo: false }, (err) => {
    if (err) {
      throw new Error(
        `Failed to logout user ${req.user?.id} correctly due to ${err}`
      );
    }
  });
  res.redirect("/");
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
