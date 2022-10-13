import express, { Router } from "express";
import passport from "passport";
import { checkAuthenticated } from "../middleware/check-auth";
import pool from "../config/db";

import * as userModels from "../models/users";

const router: Router = express.Router();

router.get("/", checkAuthenticated, (req, res) => {
  res.render("login/index");
});

router.post(
  "/user",
  passport.authenticate("local", {
    failureRedirect: "/",
    failureFlash: true,
  }),
  (req, res) => {
    console.log("---------------------------")
    userModels.getRole(req.body.email, (role: string) => {
      console.log(role);
      switch(role){
        
        case "admin":
          return res.redirect("../admin/");
        case "manager":
          return res.redirect("../dashboard/");
        case "startup":
          return res.render("supplier/index");
        default:
          //return res.render("dashboard/index");
      }
    });
  }
);

router.get("/logout", (req, res) => {
  req.logout({ keepSessionInfo: false }, (err) => {});
  res.redirect("/");
});

module.exports = router;
