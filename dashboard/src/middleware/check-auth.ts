import { Request, Response, NextFunction } from "express";

export function getRoleDestination(role: string | undefined): string {
  if (role === "admin") {
    return "/admin";
  }
  if (role === "startup") {
    return "/startup";
  }
  return "/fund";
}

export function checkAuthenticated(
  req: Request,
  res: Response,
  next: () => void
) {
  if (req.isAuthenticated()) {
    return res.redirect(getRoleDestination(req.user?.role));
  }
  next();
}

export function checkNotAuthenticated(
  req: Request,
  res: Response,
  next: () => void
) {
  if (req.isAuthenticated()) {
    return next();
  }

  console.error("User not authenticated. Redirect to login.");
  res.redirect("/");
}

// Restricts a router to the given user roles. Startup and fund sessions are
// bound to the entity assigned to the logged-in user, so request handlers
// never operate on another startup's or fund's data.
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user === undefined || !roles.includes(user.role)) {
      console.error(
        `User ${user?.id} with role ${user?.role} is not allowed to access ${req.originalUrl}.`
      );
      return res.status(403).send("Forbidden");
    }

    if (user.role === "startup") {
      if (user.startup == null) {
        return res.status(403).send("Forbidden");
      }
      req.session.startupId = String(user.startup);
    }

    if (user.role === "fund" || user.role === "stakeholder") {
      if (user.fund == null) {
        return res.status(403).send("Forbidden");
      }
      req.session.fundId = String(user.fund);
    }

    next();
  };
}
