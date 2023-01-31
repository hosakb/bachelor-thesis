import passportLocal from "passport-local";
import { PassportStatic } from "passport";
import bcrypt from "bcryptjs";
import {
  User,
  LoginUser,
  getLoginUserByEmail,
  getLoginUserById,
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
            const loginUser: LoginUser = await getLoginUserByEmail(email);

            bcrypt.compare(
              password,
              loginUser.password,
              (err: Error, isMatch: boolean) => {
                if (err) {
                  throw new Error("User authentication failed. " + err);
                }

                if (isMatch) {
                  const user: User = {
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

  passport.serializeUser((user: User, done) => done(null, user.id));

  passport.deserializeUser(async (id: string, done) => {
    try {
      const loginUser: LoginUser = await getLoginUserById(id);
      return done(null, loginUser);
    } catch (err) {
      return done(err);
    }
  });
}
