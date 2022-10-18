import express, { Express, Request, Response, Router } from "express";
import { checkAuthenticated } from "../middleware/check-auth";
import passport from "passport";
import pool from "../config/db";

const router: Router = express.Router();

router.get("/", checkAuthenticated, (req, res) => {
  res.render("index");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/",
    failureFlash: true,
  }),
  (req, res) => {
    const { email } = req.body;

    pool.query(
      `SELECT role FROM users
      WHERE email = $1`,
      [email],
      (err, result) => {
        if (err) {
          throw new Error(
            "Failed query the user role after login. Error: " + err
          );
        }

        if (result.rowCount > 1) {
          throw new Error("To many roles for user with mail: " + email);
        }

        const role = result.rows[0].role;

        if (role === undefined) {
          throw new Error(
            "Failed query the user role after login. User role does not exist."
          );
        }

        switch (role) {
          case "admin":
            return res.redirect("/admin");
          case "gm":
            return res.redirect("/dashboard");
          case "startup":
            return res.redirect("/submit");
          default:
            console.log("No role assigned to user. Please contact the admin.");
            return res.redirect("/");
        }
      }
    );
  }
);

router.get("/logout", (req, res) => {
  req.logout({ keepSessionInfo: false }, (err) => {});
  res.redirect("/");
});

module.exports = router;
