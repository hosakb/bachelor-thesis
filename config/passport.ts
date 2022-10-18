import passportLocal from "passport-local";
import { PassportStatic } from "passport";
import pool from "./db";
import bcrypt from "bcryptjs";

const LocalStrategy = passportLocal.Strategy;

export default function initPassport(passport: PassportStatic) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },

      (email: string, password: string, done) => {
        pool.query(
          `SELECT * FROM users WHERE email = $1`,
          [email],
          (err, results) => {
            if (err) {
              throw new Error("User authentication failed. " + err);
            }

            if (results.rowCount > 0) {
              const user = results.rows[0];

              bcrypt.compare(
                password,
                user.password,
                (err: Error, isMatch: any) => {
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

  passport.serializeUser((user: any, done) => done(null, user.id));

  passport.deserializeUser((id: any, done) => {
    pool.query(`SELECT * FROM users WHERE id = $1`, [id], (err, results) => {
      if (err) {
        return done(err);
      }
      console.log(`ID is ${results.rows[0].id}`);
      return done(null, results.rows[0]);
    });
  });
}
