import express, { Express, Request, Response, Router } from 'express';
const router: Router = express.Router();

router.get("/", (req, res) => {
  res.render("dashboard/index");
});

module.exports = router;
