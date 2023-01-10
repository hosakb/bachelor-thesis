import express, { Router } from "express";
import {
  deleteStartup,
  getAllStartups,
  getStartupById,
  getStartups,
  insertNewStartup,
  updateStartupName,
} from "../models/startup";
import { getFunds } from "../models/fund";
import {
  deleteUser,
  emailRegistered,
  getFounders,
  getLoginUserById,
  getUsers,
  insertUser,
  NewUser,
  UpdatedUser,
  updateUser,
} from "../models/users";
import bcrypt from "bcryptjs";
import { getHashedPassword } from "../api/business-central";
import {
  AdminBusinessCentralUser,
  deleteBusinessCentralUser,
  getBusinessCentralUserByStartupId,
  insertBusinessCentralUser,
  updateBusinessCentralUser,
} from "../models/businessCentral";
import {
  deleteStartupFundRelationship,
  insertFundStartupRelation,
} from "../models/fund_startup_map";

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

router.get("/users", async (req, res) => {
  try {
    res.render("admin/users", {
      layout: "../views/layouts/admin.ejs",
      scripts: ["/js/admin/users"],
      page: "users",
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
      id: id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } catch (err) {
    throw new Error(`Failed to query user for id ${id}. Error: ${err}`);
  }
});

router.post("/email-taken", async (req, res) => {
  const { email } = req.body;
  try {
    const taken = await emailRegistered(email);
    res.status(200).json(taken);
  } catch (err) {
    throw new Error(
      `Failed to check for existing email: ${email}. Error: ${err}`
    );
  }
});

router.post("/add-user", async (req, res) => {
  const { firstName, lastName, email, password, role, fund, startup } =
    req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: NewUser = {
      firstName,
      lastName,
      email,
      hashedPassword,
      role,
      startup,
      fund,
    };

    await insertUser(newUser);
    res.status(200).json({
      firstName,
      lastName,
      email,
      password,
      role,
      startup,
      fund,
    });
  } catch (err) {
    throw new Error(
      `Failed to insert new user with email: ${email}. Error: ${err}`
    );
  }
});

router.post("/edit-user", async (req, res) => {
  const { id, firstName, lastName, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: UpdatedUser = {
      id: id,
      firstName,
      lastName,
      email,
      hashedPassword,
    };

    await updateUser(newUser);
    res.status(200).json();
  } catch (err) {
    throw new Error(
      `Failed to insert new user with email: ${email}. Error: ${err}`
    );
  }
});

router.post("/delete-user", async (req, res) => {
  const { id } = req.body;
  try {
    await deleteUser(id);
    res.status(200).json();
  } catch (err) {
    throw new Error(`Failed to delete new user with id: ${id}. Error: ${err}`);
  }
});

router.get("/startups", async (req, res) => {
  try {
    res.render("admin/startups", {
      layout: "../views/layouts/admin.ejs",
      scripts: ["/js/admin/startups"],
      page: "startups",
      title: "Admin Panel",
      name: "Admin Name", // TODO: make dynamic,
      funds: await getFunds(),
      founders: await getFounders(),
      startups: await getStartups(),
    });
  } catch (err) {
    throw new Error(
      `Failed to load all startups into the admin panel due to error: ${err}`
    );
  }
});

router.post("/add-startup", async (req, res) => {
  const { name, bcUsername, bcPassword, fund, bcCompany } = req.body;

  try {
    const startupId = await insertNewStartup(name);
    const { lm, nt } = getHashedPassword(bcPassword);
    const bcUser: AdminBusinessCentralUser = {
      company: bcCompany,
      username: bcUsername,
      startupId,
      lmHashedPassword: lm,
      ntHashedPassword: nt,
    };
    await insertBusinessCentralUser(bcUser);
    await insertFundStartupRelation(fund, startupId);
    res.status(200).json();
  } catch (err) {
    throw new Error(`Failed to add new startup. Error: ${err}`);
  }
});

router.post("/get-startup", async (req, res) => {
  const { id } = req.body;

  try {
    const startup = await getStartupById(id);
    const bc = await getBusinessCentralUserByStartupId(id);

    res.status(200).json({
      name: startup.name,
      company: bc.company,
      username: bc.username,
    });
  } catch (err) {
    throw new Error(`Failed to get startup for id: ${id}. Error: ${err}`);
  }
});

router.post("/update-startup", async (req, res) => {
  const { id, name, bcUsername, bcPassword, bcCompany } = req.body;

  console.log(bcPassword);

  try {
    await updateStartupName(name, id);
    const { lm, nt } = getHashedPassword(bcPassword);
    const bcUser: AdminBusinessCentralUser = {
      company: bcCompany,
      username: bcUsername,
      startupId: id,
      lmHashedPassword: lm,
      ntHashedPassword: nt,
    };
    await updateBusinessCentralUser(bcUser);
    res.status(200).json();
  } catch (err) {
    throw new Error(`Failed to update new startup. Error: ${err}`);
  }
});

router.post("/delete-startup", async (req, res) => {
  const { id } = req.body;

  try {
    await deleteStartup(id);
    await deleteBusinessCentralUser(id);
    await deleteStartupFundRelationship(id);
    res.status(200).json();
  } catch (err) {
    throw new Error(`Failed to update new startup. Error: ${err}`);
  }
});

export default router;
