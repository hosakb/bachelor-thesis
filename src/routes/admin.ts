import express, { Router } from "express";
import { getAllStartups } from "../models/startup";
import { getFunds } from "../models/fund";
import { getLoginUserById, getUsers } from "../models/users";

const router: Router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.render("admin/index", {
      layout: "../views/layouts/admin.ejs",
      scripts: [],
      page: "admin",
      title: "Admin Panel",
      name: "Admin Name", // TODO: make dynamic
      funds: await getFunds(),
      startups: await getAllStartups(),
      users: await getUsers(),
    });
  } catch (err) {
    throw new Error(
      `Failed to load all startups into the admin panel due to error: ${err}`
    );
  }
});

router.get("/add-users", async (req, res) => {
  try {
    res.render("admin/add_users", {
      layout: "../views/layouts/admin.ejs",
      scripts: ["/js/admin/add-users"],
      page: "add-users",
      title: "Admin Panel",
      name: "Admin Name", // TODO: make dynamic,
      funds: await getFunds(),
      startups: await getAllStartups(),
      users: await getUsers(),
    });
  } catch (err) {
    throw new Error(
      `Failed to load all startups into the admin panel due to error: ${err}`
    );
  }
});

router.post("/get-user", async (req, res) => {
  const { id } = req.body;
  try {
    const user = await getLoginUserById(id);
    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } catch (err) {
    throw new Error(`Failed to query user for id ${id}. Error: ${err}`);
  }
});

export default router;
