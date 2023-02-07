"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
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
router.post("/login", passport_1.default.authenticate("local", {
    failureRedirect: "/",
    failureFlash: true,
}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const userRole = yield (0, users_1.getUserRole)(email);
        switch (userRole.role) {
            case users_1.Role.Admin:
                return loginAdmin(userRole, res);
            case users_1.Role.Startup:
                return loginOrOnboardStartupUser(userRole, email, res, req);
            case users_1.Role.Fund:
                return loginFund(userRole, req, res);
            case users_1.Role.Stakeholder:
                return loginFund(userRole, req, res);
            default:
                throw new Error("No role assigned to user.");
        }
    }
    catch (error) {
        console.info(error + " Redirecting to login page.");
        return res.redirect("/");
    }
}));
router.get("/logout", (req, res) => {
    req.logout({ keepSessionInfo: false }, (err) => {
        var _a;
        if (err) {
            throw new Error(`Failed to logout user ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.id} correctly due to ${err}`);
        }
    });
    res.redirect("/");
});
exports.default = router;
function loginFund(userRole, req, res) {
    console.info(`Logged in as fund with id ${userRole.id} and redirected to /fund/${userRole.id}`);
    req.session.fundId = userRole.id;
    return res.redirect("/fund");
}
function loginAdmin(userRole, res) {
    console.info(`Logged in as admin with id
          ${userRole.id}
            and redirected to /admin/`);
    return res.redirect("/admin");
}
function loginOrOnboardStartupUser(userRole, email, res, req) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (yield (0, startup_1.getFirstStartupLoginById)(userRole.id)) {
                console.info(`First login as startup with id ${userRole.id} and redirected to /onboarding/startup due to first login.}`);
                return res.redirect("/onboarding/startup");
            }
            if (!(yield (0, startup_1.getTrlAvailable)(userRole.id))) {
                console.info(`TRL information missing for startup with id ${userRole.id}. Redirecting to /onboarding/product due to first login.}`);
                return res.redirect("/onboarding/product");
            }
            if (!(yield (0, startup_1.getQuestionnaireFilledOut)(userRole.id))) {
                console.info(`Rating information missing for startup with id ${userRole.id}. Redirecting to /onboarding/questionnaire due to first login.}`);
                return res.redirect("/onboarding/questionnaire");
            }
            req.session.startupId = userRole.id;
            if (yield (0, users_1.getFirstUserLoginByEmail)(email)) {
                console.info(`First login as user with id ${userRole.id} and redirected to /onboarding/ due to first login.}`);
                return res.redirect("/onboarding/track-record");
            }
            console.info(`Logged in as startup with id ${userRole.id} and redirected to /startup/${userRole.id}`);
            return res.redirect("/startup");
        }
        catch (error) {
            throw new Error(`Failed to query first login attempt from db due to ${error}.`);
        }
    });
}
