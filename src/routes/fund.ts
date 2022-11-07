import express, { Router } from "express";
import { getFundNameById } from "../models/fund";

import { fundIdExists, getStartupsForFund } from "../models/fund_startup_map";
import { getStartupKpiRequestData } from "./startup";

const router: Router = express.Router();

router.get("/", (req, res) => {
  if (req.session.fundId !== undefined) {
    res.redirect("/fund/" + req.session.fundId);
  } else if (req.session.startupId !== undefined) {
    res.redirect("/startup/" + req.session.startupId);
  } else {
    res.redirect("/admin");
  }
});

router.get("/:fundId", (req, res) => {
  // TMP (fund) charts
  res.render("dashboard/fund/index", {
    layout: "../views/layouts/fund.ejs",
    kpiI: 55, // TODO:
    kpiII: 33,
    kpiIII: 66,
    page: "dashboard",
    startup: false,
    title: req.fundName, // TODO: make dynamic
    name: req.user?.firstName + " " + req.user?.lastName,
  });
});

router.param("fundId", async (req, res, next, fundId) => {
  try {
    req.fundName = await getFundNameById(fundId);

    if (await !fundIdExists(fundId)) {
      res.redirect("/"); // invalid query result for fundId
      return;
    }

    req.session.startupTable = await getStartupsForFund(fundId);

    next();
  } catch (error) {
    throw new Error(
      `Failed to query funds and startups for fund id ${fundId} with error: ${error}`
    );
  }
});

router.get("/table/values", (req, res) => {
  res.status(200).json(req.session.startupTable);
});

router.post("/startup", (req, res) => {
  res.setHeader("content-type", "application/javascript");
  res.redirect(`startup/${req.body.id}`);
});

router.get("/startup/:startupId/", (req, res) => {
  res.render("dashboard/startup/index", {
    layout: "../views/layouts/fund.ejs",
    phase: req.phase,
    kpis: req.kpis,
    title: req.startupName,
    name: req.user?.firstName + " " + req.user?.lastName,
  });
});

router.get("/chart/npm", (req, res) => {
  res.status(200).json(req.session.netProfitMarginTs);
});

router.get("/chart/cfr", (req, res) => {
  res.status(200).json(req.session.cashFlowRateTs);
});

router.get("/chart/liq", (req, res) => {
  res.status(200).json(req.session.liquidityTs);
});

router.param("startupId", async (req, res, next, startupId) => {
  try {
    await getStartupKpiRequestData(req, startupId);
  } catch (error) {
    throw new Error(
      `Failed to fetch startup kpi request data for startup with id ${startupId}`
    );
  }

  next();
});

export default router;
