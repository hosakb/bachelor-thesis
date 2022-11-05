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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const startup_1 = require("../models/startup");
const users_1 = require("../models/users");
const router = express_1.default.Router();
router.get("/", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      let startups = yield (0, startup_1.getStartups)();
      res.render("admin/index", { startups });
    } catch (err) {
      throw new Error(
        `Failed to load all startups into the admin panel due to error: ${err}`
      );
    }
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
      try {
        let hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        let registered = yield (0, users_1.emailRegistered)(email);
        if (registered) {
          errors.push({ message: "Email already registered." });
          res.render("admin/index", { errors });
        } else {
          yield (0, startup_1.insertUser)(
            firstName,
            lastName,
            email,
            hashedPassword
          );
          req.flash(
            "success_msg",
            "Successfully registered " + firstName + " " + lastName
          );
          res.redirect("/user/login");
        }
      } catch (error) {}
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
            password: yield bcryptjs_1.default.hash(user.password, 10),
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
exports.default = router;
