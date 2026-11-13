import { randomBytes } from "crypto";
import { SessionOptions } from "express-session";

// Pure configuration builder so production failure and demo behavior can be
// tested without reading .env, connecting to a database or opening a listener.
export const sessionOptions = (
  env: NodeJS.ProcessEnv = process.env
): SessionOptions => {
  const production = env.NODE_ENV === "production";
  const configured = env.SESSION_SECRET;
  if (
    (production && !configured) ||
    (configured !== undefined && configured.trim().length < 32)
  ) {
    throw new Error("SESSION_SECRET must contain at least 32 characters after trimming. Production requires explicit configuration.");
  }
  return {
    secret: configured || randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: production,
    },
  };
};
