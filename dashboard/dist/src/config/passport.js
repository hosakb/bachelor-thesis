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
const passport_local_1 = __importDefault(require("passport-local"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const users_1 = require("../models/users");
const LocalStrategy = passport_local_1.default.Strategy;
function initPassport(passport) {
    passport.use(new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
    }, (email, password, done) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (yield (0, users_1.emailRegistered)(email)) {
                const loginUser = yield (0, users_1.getLoginUserByEmail)(email);
                bcryptjs_1.default.compare(password, loginUser.password, (err, isMatch) => {
                    if (err) {
                        throw new Error("User authentication failed. " + err);
                    }
                    if (isMatch) {
                        const user = {
                            id: loginUser.id,
                            firstName: loginUser.firstName,
                            lastName: loginUser.lastName,
                            email: loginUser.email,
                            role: loginUser.role,
                            created_at: loginUser.created_at,
                            updated_at: loginUser.updated_at,
                            startup: loginUser.startup,
                            fund: loginUser.fund,
                        };
                        return done(null, user);
                    }
                    else {
                        return done(null, false, {
                            message: "Password is not correct",
                        });
                    }
                });
            }
            else {
                return done(null, false, { message: "Email not registered" });
            }
        }
        catch (err) {
            return done(err, false);
        }
    })));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => __awaiter(this, void 0, void 0, function* () {
        try {
            const loginUser = yield (0, users_1.getLoginUserById)(id);
            return done(null, loginUser);
        }
        catch (err) {
            return done(err);
        }
    }));
}
exports.default = initPassport;
