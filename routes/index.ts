import express, { Express, Request, Response, Router } from "express";
import { checkAuthenticated } from "../middleware/check-auth";
import passport from "passport";

import { Role, UserRole, getUserRole } from "../models/users";

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

    let userRole: UserRole = await getUserRole(email);

    switch (userRole.role) {
      case Role.Admin:
        console.log(
          `Logged in as admin with id
          ${userRole.id}
            and redirected to /admin/`
        );
        console.log(
          "-------- Session ------------------\n" +
            JSON.stringify(req.session) +
            "\n-----------------------"
        );
        return res.redirect("/admin");
      case Role.Startup:
        console.log(
          `Logged in as startup with id ${userRole.id} and redirected to /startup/${userRole.id}`
        );
        req.session.startupId = userRole.id;
        console.log(
          "-------- Session ------------------\n" +
            JSON.stringify(req.session) +
            "\n-----------------------"
        );
        return res.redirect("/startup/" + userRole.id);
      case Role.Fund:
        console.log(
          `Logged in as fund with id ${userRole.id} and redirected to /fund/${userRole.id}`
        );
        req.session.fundId = userRole.id;
        console.log(
          "-------- Session ------------------\n" +
            JSON.stringify(req.session) +
            "\n-----------------------"
        );
        return res.redirect("/fund/" + userRole.id);
        return;
      default:
        console.log("No role assigned to user. Please contact the admin.");
        return res.redirect("/");
    }
  }
);

router.get("/logout", (req, res) => {
  req.logout({ keepSessionInfo: false }, (err) => {});
  res.redirect("/");
});

module.exports = router;
