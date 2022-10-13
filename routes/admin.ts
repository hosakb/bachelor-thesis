import express, { Express, Request, Response, Router } from "express";
import pool from "../config/db";
import { checkAuthenticated } from "../middleware/check-auth";
const bcrypt = require("bcryptjs");

interface Err {
  message: string
}


const router: Router = express.Router();

router.get("/", (req, res) => {
  res.render("admin/index");
});

router.get("/register", checkAuthenticated, (req, res) => {
  res.render("admin/register/user");
});

router.post("/user-registration", async (req, res) => {
  const { firstName, lastName, email, password, password2 } = req.body;

  const errors: Err[] = [];

  if (!firstName || !lastName || !email || !password || !password2) {
    errors.push({
      message:
        "Not all fields have been populated with the required information.",
    });
  }

  if (password !== password2) {
    errors.push({ message: "The entered passwords do not match." });
  }

  if (errors.length > 0) {
    res.render("admin/index", { errors });
  } else {
    let hashedPassword = await bcrypt.hash(password, 10);
    pool.query(
      `SELECT * FROM users
        WHERE email = $1`,
      [email],
      (err, result) => {
        if (err) {
          throw new Error("Failed to check if user exists. Error: " + err);
        }

        if (result.rowCount > 0) {
          errors.push({ message: "Email already registered." });
          res.render("admin/index", { errors });
        } else {
          pool.query(
            `INSERT INTO users (first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, $5)`,
            [firstName, lastName, email, hashedPassword, ""],
            (err, result) => {
              if (err) {
                throw new Error(
                  "Failed to create new user due to the following error: " + err
                );
              }

              req.flash(
                "success_msg",
                "Successfully registered " + firstName + " " + lastName
              );
              res.redirect("/user/login");
            }
          );
        }
      }
    );
  }
});

router.get("/onboarding", (req, res) => {
  res.render("admin/onboarding");
});

module.exports = router;
