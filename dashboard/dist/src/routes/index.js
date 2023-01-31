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
const check_auth_1 = require("../middleware/check-auth");
const passport_1 = __importDefault(require("passport"));
const users_1 = require("../models/users");
const startup_1 = require("../models/startup");
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
  (req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const { email } = req.body;
      const userRole = yield (0, users_1.getUserRole)(email);
      switch (userRole.role) {
        case users_1.Role.Admin:
          console.log(`Logged in as admin with id
          ${userRole.id}
            and redirected to /admin/`);
          return res.redirect("/admin");
        case users_1.Role.Startup:
          try {
            const firstStartupLogin = yield (0,
            startup_1.getFirstStartupLoginById)(userRole.id);
            console.log("-------------------");
            if (firstStartupLogin) {
              console.log(
                `First login as startup with id ${userRole.id} and redirected to /onboarding/startup due to first login.}`
              );
              return res.redirect("/onboarding/startup");
            }
            const firstUserLogin = yield (0, users_1.getFirstUserLoginByEmail)(
              email
            );
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
        case users_1.Role.Fund:
          console.log(
            `Logged in as fund with id ${userRole.id} and redirected to /fund/${userRole.id}`
          );
          req.session.fundId = userRole.id;
          return res.redirect("/fund");
        default:
          console.log("No role assigned to user. Please contact the admin.");
          return res.redirect("/");
      }
    })
);
router.get("/logout", (req, res) => {
  req.logout({ keepSessionInfo: false }, (err) => {
    var _a;
    if (err) {
      throw new Error(
        `Failed to logout user ${
          (_a = req.user) === null || _a === void 0 ? void 0 : _a.id
        } correctly due to ${err}`
      );
    }
  });
  res.redirect("/");
});
exports.default = router;
