import express, { Router, Request } from "express";
import { Row } from "read-excel-file";
import { getFundNameById } from "../models/fund";

import { fundIdExists, getStartupsForFund } from "../models/fund_startup_map";
import { getCapTable, getMilestones } from "../models/startup";
import {
  getExpertiseByStartup,
  getFoundersByStartupId,
} from "../models/track_record";
import { Expertise } from "../util/types/express";
import { getStartupKpiRequestData } from "./startup";

const router: Router = express.Router();

router.get("/", async (req, res) => {
  const fundId = req.user?.fund;

  if (fundId === undefined) {
    if (req.user?.startup !== undefined) {
      console.log(
        `Redirecting user ${req.user?.id} to startup screen since no fund id is assigned.`
      );
      res.redirect("/startup");
    } else {
      console.log(
        `Redirecting user ${req.user?.id} to login screen since no fund id or startup id are assigned.`
      );
      res.redirect("/");
    }
  } else {
    try {
      if (await !fundIdExists(fundId)) {
        res.redirect("/"); // invalid query result for fundId
        return;
      }

      req.session.startupTable = await getStartupsForFund(fundId);

      res.render("dashboard/fund/index", {
        layout: "../views/layouts/dashboard.ejs",
        dashboard: "fund",
        scripts: ["/js/table/table", "/js/table/ag-grid-community.min"],
        kpiI: 55,
        kpiII: 33,
        kpiIII: 66,
        page: "dashboard",
        title: await getFundNameById(fundId),
        name: req.user?.firstName + " " + req.user?.lastName,
        view: "fund",
      });
    } catch (error) {
      console.error(
        `Failed to fetch fund data for startup with id ${fundId} due to:\n${error}.\nRedirecting to login screen.`
      );
      res.redirect("/");
    }
  }
});

router.get("/table/values", (req, res) => {
  res.status(200).json(req.session.startupTable);
});

router.post("/startup", (req, res) => {
  req.session.selectedStartup = req.body.id;
  res.setHeader("content-type", "application/javascript");
  res.redirect(`startup`);
});

router.get("/startup/founders", async (req, res) => {
  const startupId = req.session.selectedStartup;

  if (startupId === undefined) {
    console.log(
      `Redirecting user ${req.user?.id} to fund screen since no selected startup was found.`
    );
    res.redirect("/fund/");
  }
  try {
    res.render("dashboard/founders/index", {
      layout: "../views/layouts/dashboard.ejs",
      dashboard: "fund",
      scripts: [],
      title: req.startupName,
      name: req.user?.firstName + " " + req.user?.lastName,
      page: "founder",
      founders: await getFoundersByStartupId(startupId),
      startup: req.session.selectedStartup,
    });
  } catch (error) {
    console.error(
      `Failed to fetch startup request data for startup with id ${startupId} due to:\n${error}.\nRedirecting to fund dashboard.`
    );
    res.redirect("/fund/");
  }
});

router.get("/startup/", async (req, res) => {
  const startupId = req.session.selectedStartup;

  if (startupId === undefined) {
    console.log(
      `Redirecting user ${req.user?.id} to fund screen since no selected startup was found.`
    );
    res.redirect("/fund/");
  }

  try {
    await getStartupKpiRequestData(req, startupId);
    await extractExpertise(startupId, req);
    const capTable: Row[] = await getCapTable(startupId);

    res.render("dashboard/startup/index", {
      layout: "../views/layouts/dashboard.ejs",
      scripts: ["/js/gantt/frappe-gantt.min", "/js/chart/chart.min", "/js/fund"],
      dashboard: "fund",
      kpis: req.kpis,
      title: req.startupName,
      page: "dashboard",
      view: "startup",
      name: req.user?.firstName + " " + req.user?.lastName,
      startup: req.session.selectedStartup,
      capTable,
    });
  } catch (error) {
    console.error(
      `Failed to fetch startup request data for startup with id ${startupId} due to:\n${error}.\nRedirecting to fund dashboard.`
    );
    res.redirect("/fund/");
  }
});

router.get("/chart/noe", (req, res) => {
  res.status(200).json(req.session.numberOfEmployeesTs);
});

router.get("/chart/cfr", (req, res) => {
  res.status(200).json(req.session.cashFlowRateTs);
});

router.get("/chart/liq", (req, res) => {
  res.status(200).json(req.session.liquidityTs);
});

router.get("/chart/expertise", (req, res) => {
  res.status(200).json(req.session.expertise);
});

router.get("/chart/gantt", async (req, res) => {
  try {

    const startupId = req.session.selectedStartup;

  if (startupId === undefined) {
    console.log(
      `Redirecting user ${req.user?.id} to fund screen since no selected startup was found.`
    );
    res.redirect("/fund/");
  }

  const milestones = await getMilestones(startupId);
  res.status(200).json(milestones);
  } catch (error) {
    res.status(200).json([]);
  }
});

export default router;

async function extractExpertise(startupId: string, req: Request) {
  const expertiseValues = await getExpertiseByStartup(startupId);

  const expertise: Expertise = {
    name: [],
    amount: [],
  };

  for (const i of expertiseValues) {
    if (!expertise.name.includes(i)) {
      expertise.name.push(i);
      const amount = expertiseValues.filter((x) => x == i);
      expertise.amount.push(amount.length);
    }
  }

  req.session.expertise = expertise;
}
