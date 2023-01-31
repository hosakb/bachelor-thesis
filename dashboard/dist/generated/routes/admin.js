"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../config/db"));
const check_auth_1 = require("../middleware/check-auth");
const bcrypt = require("bcryptjs");
const router = express_1.default.Router();
router.get("/", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    let startups;
    try {
      const res = yield db_1.default.query(`SELECT name, stage FROM startup`);
      startups = res.rows.map((row) => {
        return { id: row.id, name: row.name, stage: row.stage };
      });
    } catch (err) {
      throw new Error(
        "Failed to fetch startups due to the following error: " + err
      );
    }
    res.render("admin/index", { startups });
  })
);
router.get("/register", check_auth_1.checkAuthenticated, (req, res) => {
  res.render("admin/register/user");
});
// user registration
router.post("/user-registration", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, password, password2 } = req.body;
    const errors = [];
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
      let hashedPassword = yield bcrypt.hash(password, 10);
      db_1.default.query(
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
            db_1.default.query(
              `INSERT INTO users (first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, $5)`,
              [firstName, lastName, email, hashedPassword, ""],
              (err, result) => {
                if (err) {
                  throw new Error(
                    "Failed to create new user due to the following error: " +
                      err
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
  })
);
router.get("/onboarding", (req, res) => {
  res.render("admin/onboarding");
});
router.post("/new-startup", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const { name, phase, users } = req.body;
    let startupUsers = JSON.parse(users);
    let id;
    try {
      const res = yield db_1.default.query(
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
    let assignedStartupUser = yield Promise.all(
      startupUsers.map((user) =>
        __awaiter(void 0, void 0, void 0, function* () {
          return {
            firstName: user.firstName,
            lastName: user.lastName,
            password: yield bcrypt.hash(user.password, 10),
            email: user.email,
            role: user.role,
            startup: id,
          };
        })
      )
    );
    assignedStartupUser.forEach((user) => {
      db_1.default.query(
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
  })
);
module.exports = router;
