import passportLocal from "passport-local";
import { PassportStatic } from "passport";
import pool from "./db";
import bcrypt from "bcryptjs";
import {
  User,
  getUserByEmail,
  getUserById,
  emailRegistered,
} from "../models/users";

const LocalStrategy = passportLocal.Strategy;

export default function initPassport(passport: PassportStatic) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },

      async (email: string, password: string, done) => {
        try {
          if (await emailRegistered(email)) {
            let user: User = await getUserByEmail(email);

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
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => done(null, user.id));

  passport.deserializeUser(async (id: string, done) => {
    try {
      let user = await getUserById(id);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  });
}
