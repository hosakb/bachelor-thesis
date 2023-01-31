"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const check_auth_1 = require("../middleware/check-auth");
const passport_1 = __importDefault(require("passport"));
const db_1 = __importDefault(require("../config/db"));
const router = express_1.default.Router();
router.get("/", check_auth_1.checkAuthenticated, (req, res) => {
  res.render("index", { layout: "../views/layouts/login.ejs" });
});
router.post(
  "/login",
  passport_1.default.authenticate("local", {
    failureRedirect: "/",
    failureFlash: true,
  }),
  (req, res) => {
    const { email } = req.body;
    db_1.default.query(
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
            return res.redirect(
              "/dashboard/01041536-a76f-43a5-a3e1-c0e76f8acefa"
            );
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
