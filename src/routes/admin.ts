import express, { Router } from "express";
import pool from "../config/db";
import { checkAuthenticated } from "../middleware/check-auth";
import bcrypt from "bcryptjs";
import { getStartups } from "../models/startup";
import { emailRegistered, insertUser } from "../models/users";

interface Err {
  message: string;
}

const router: Router = express.Router();

interface User {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  role: string;
  startup: string | undefined;
}

router.get("/", async (req, res) => {
  try {
    const startups = await getStartups();
    res.render("admin/index", { startups });
  } catch (err) {
    throw new Error(
      `Failed to load all startups into the admin panel due to error: ${err}`
    );
  }
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
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const registered = await emailRegistered(email);

      if (registered) {
        errors.push({ message: "Email already registered." });
        res.render("admin/index", { errors });
      } else {
        await insertUser(firstName, lastName, email, hashedPassword);

        req.flash(
          "success_msg",
          "Successfully registered " + firstName + " " + lastName
        );
        res.redirect("/user/login");
      }
    } catch (error) {
      throw new Error(`Failed to register new user due to ${error}`);
    }
  }
});

router.get("/onboarding", (req, res) => {
  res.render("admin/onboarding");
});

router.post("/new-startup", async (req) => {
  console.log(req.body);

  const { name, phase, users } = req.body;

  const startupUsers: User[] = JSON.parse(users);
  let id: string;

  try {
    const res = await pool.query(
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

  const assignedStartupUser: User[] = await Promise.all(
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
      (err) => {
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

export default router;
