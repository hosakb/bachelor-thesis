import express, { Express, Request, Response, Router } from 'express';
const users = require('../models/users');
const router: Router = express.Router();

router.get("/", (req, res) => {
  res.render("admin/index");
});

router.get("/register", (req, res) => {
  res.render("admin/register/user");
});

router.post("/user-registration", (req, res) => {
  const {firstName, lastName, email, password, password2} = req.body;
  
  const errors = [];

  if (!firstName || !lastName || !email || !password || !password2) {
    errors.push({message: "Not all fields have been populated with the required information."})
  }

  if (password !== password2) {
    errors.push({message: "The entered passwords do not match."})
  }

  if(errors.length > 0) {
    res.render("admin/index", {errors});
  }

});


module.exports = router;