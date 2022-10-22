import express, { Express, Request, Response, Router } from "express";
import { QueryResult } from "pg";
import pool from "../config/db";
import { checkAuthenticated } from "../middleware/check-auth";
const bcrypt = require("bcryptjs");

interface Err {
  message: string;
}

const router: Router = express.Router();

interface Startup {
  id: string;
  name: string;
  stage: string;
}

interface User {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  role: string;
  startup: string | undefined;
}

router.get("/", async (req, res) => {
  let startups: Startup[];
  try {
    const res: QueryResult<any> = await pool.query(
      `SELECT name, stage FROM startup`
    );

    startups = res.rows.map((row) => {
      return { id: row.id, name: row.name, stage: row.stage };
    });
  } catch (err) {
    throw new Error(
      "Failed to fetch startups due to the following error: " + err
    );
  }

  res.render("admin/index", { startups });
});

router.get("/register", checkAuthenticated, (req, res) => {
  res.render("admin/register/user");
});

// user registration
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

router.post("/new-startup", async (req, res) => {
  console.log(req.body);

  const { name, phase, users } = req.body;

  let startupUsers: User[] = JSON.parse(users);
  let id: string;

  try {
    const res: QueryResult<any> = await pool.query(
      `INSERT INTO startup (name, stage) VALUES ($1, $2) RETURNING id`,
      [name, phase]
    );

    id = res.rows[0].id;
  } catch (err) {
    throw new Error(
      "Failed to create new startup due to the following error: " + err
    );
  }

  req.flash("success_msg", "Successfully registered startup: " + name);

  let assignedStartupUser: User[] = await Promise.all(
    startupUsers.map(async (user) => {
      return {
        firstName: user.firstName,
        lastName: user.lastName,
        password: (await bcrypt.hash(user.password, 10)) as string,
        email: user.email,
        role: user.role,
        startup: id,
      };
    })
  );

  assignedStartupUser.forEach((user) => {
    pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role, startup) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.firstName,
        user.lastName,
        user.email,
        user.password,
        user.role,
        user.startup,
      ],
      (err, result) => {
        if (err) {
          throw new Error(
            "Failed to create new startup due to the following error: " + err
          );
        }
      }
    );
  });

  req.flash("success_msg", "Successfully crated users");
});

module.exports = router;
