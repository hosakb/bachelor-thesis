import express, { Router, Request } from "express";
import { getFundNameById } from "../models/fund";

import { fundIdExists, getStartupsForFund } from "../models/fund_startup_map";
import { getStartupNameById } from "../models/startup";
import { Founder, getFoundersByStartupId } from "../models/track_record";
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

router.get("/startup/:startupId/founders", (req, res) => {
  res.render("dashboard/founders/index", {
    layout: "../views/layouts/fund.ejs",
    title: req.startupName,
    name: req.user?.firstName + " " + req.user?.lastName,
    founders: req.founders,
    startup: req.params.startupId,
  });
});

router.get("/startup/:startupId/", (req, res) => {
  res.render("dashboard/startup/index", {
    layout: "../views/layouts/fund.ejs",
    kpis: req.kpis,
    title: req.startupName,
    name: req.user?.firstName + " " + req.user?.lastName,
    founders: req.founders,
    startup: req.params.startupId,
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
    await getFounderRequestData(req, startupId);
  } catch (error) {
    throw new Error(
      `Failed to fetch startup request data for startup with id ${startupId} due to: ${error}`
    );
  }

  next();
});

async function getFounderRequestData(req: Request, startupId: string) {
  const founderData: Founder[] = await getFoundersByStartupId(startupId);
  req.founders = founderData;

  }

export default router;
