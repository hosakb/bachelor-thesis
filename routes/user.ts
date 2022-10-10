import express, { Router } from 'express';

const router: Router = express.Router();

router.get("/", (req, res) => {
  res.render('user');
});

router.post("/login", (req, res) => {
  
  });

module.exports = router;