import express, { Router } from "express";
import { checkAuthenticated } from "../middleware/check-auth";
import passport from "passport";

import {
  Role,
  UserRole,
  getUserRole,
  getFirstUserLoginByEmail,
} from "../models/users";
import { getFirstStartupLoginById } from "../models/startup";

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
    const userRole: UserRole = await getUserRole(email);

    switch (userRole.role) {
      case Role.Admin:
        console.log(
          `Logged in as admin with id
          ${userRole.id}
            and redirected to /admin/`
        );
        return res.redirect("/admin");
      case Role.Startup:
        try {
          const firstStartupLogin = await getFirstStartupLoginById(userRole.id);
          console.log("-------------------");
          if (firstStartupLogin) {
            console.log(
              `First login as startup with id ${userRole.id} and redirected to /onboarding/startup due to first login.}`
            );
            return res.redirect("/onboarding/startup");
          }

          const firstUserLogin = await getFirstUserLoginByEmail(email);

          req.session.startupId = userRole.id;

          if (firstUserLogin) {
            console.log(
              `First login as user with id ${userRole.id} and redirected to /onboarding/ due to first login.}`
            );
            return res.redirect("/onboarding");
          }

          console.log(
            `Logged in as startup with id ${userRole.id} and redirected to /startup/${userRole.id}`
          );
          return res.redirect("/startup");
        } catch (error) {
          throw new Error("Failed to query first login attempt from db.");
        }
      case Role.Fund:
        console.log(
          `Logged in as fund with id ${userRole.id} and redirected to /fund/${userRole.id}`
        );
        req.session.fundId = userRole.id;
        return res.redirect("/fund");
      default:
        console.log("No role assigned to user. Please contact the admin.");
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
