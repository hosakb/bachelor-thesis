"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const passport_local_1 = __importDefault(require("passport-local"));
const db_1 = __importDefault(require("./db"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const LocalStrategy = passport_local_1.default.Strategy;
function initPassport(passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      (email, password, done) => {
        db_1.default.query(
          `SELECT * FROM users WHERE email = $1`,
          [email],
          (err, results) => {
            if (err) {
              throw new Error("User authentication failed. " + err);
            }
            if (results.rowCount > 0) {
              const user = results.rows[0];
              bcryptjs_1.default.compare(
                password,
                user.password,
                (err, isMatch) => {
                  if (err) {
                    throw new Error("User authentication failed. " + err);
                  }
                  if (isMatch) {
                    return done(null, user);
                  } else {
                    return done(null, false, {
                      message: "Password is not correct",
                    });
                  }
                }
              );
            } else {
              return done(null, false, { message: "Email not registered" });
            }
          }
        );
      }
    )
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    db_1.default.query(
      `SELECT * FROM users WHERE id = $1`,
      [id],
      (err, results) => {
        if (err) {
          return done(err);
        }
        console.log(`ID is ${results.rows[0].id}`);
        return done(null, results.rows[0]);
      }
    );
  });
}
exports.default = initPassport;
