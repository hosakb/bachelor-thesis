import { Request, Response } from "express";
export function checkAuthenticated(req: Request, res: Response, next: () => void) {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }
  next();
}

export function checkNotAuthenticated(req: Request, res: Response, next: () => void) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
