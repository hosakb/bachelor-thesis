import express, { Router, Request } from "express";
import { getFundNameById } from "../models/fund";

import { fundIdExists, getStartupsForFund } from "../models/fund_startup_map";
import { getStartupNameById } from "../models/startup";
import { Founder, getFoundersByStartupId } from "../models/track_record";
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
        layout: "../views/layouts/fund.ejs",
        kpiI: 55,
        kpiII: 33,
        kpiIII: 66,
        page: "dashboard",
        title: await getFundNameById(fundId),
        name: req.user?.firstName + " " + req.user?.lastName,
      });
    } catch (error) {
      console.log(
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
      layout: "../views/layouts/fund.ejs",
      title: req.startupName,
      name: req.user?.firstName + " " + req.user?.lastName,
      founders: await getFoundersByStartupId(startupId),
      startup: req.session.selectedStartup,
    });
  } catch (error) {
    console.log(
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

    res.render("dashboard/startup/index", {
      layout: "../views/layouts/fund.ejs",
      kpis: req.kpis,
      title: req.startupName,
      name: req.user?.firstName + " " + req.user?.lastName,
      startup: req.session.selectedStartup,
    });
  } catch (error) {
    console.log(
      `Failed to fetch startup request data for startup with id ${startupId} due to:\n${error}.\nRedirecting to fund dashboard.`
    );
    res.redirect("/fund/");
  }
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

export default router;
