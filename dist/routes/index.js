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
      let userRole = yield (0, users_1.getUserRole)(email);
      switch (userRole.role) {
        case users_1.Role.Admin:
          console.log(`Logged in as admin with id
          ${userRole.id}
            and redirected to /admin/`);
          console.log(
            "-------- Session ------------------\n" +
              JSON.stringify(req.session) +
              "\n-----------------------"
          );
          return res.redirect("/admin");
        case users_1.Role.Startup:
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
        case users_1.Role.Fund:
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
    })
);
router.get("/logout", (req, res) => {
  req.logout({ keepSessionInfo: false }, (err) => {});
  res.redirect("/");
});
exports.default = router;
