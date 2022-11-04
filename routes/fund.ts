import express, { Router } from "express";

import { fundIdExists, getStartupsForFund } from "../models/fund_startup_map";
import { getKpis, Startup } from "../models/startup";

import isUuid from "../util/uuid";

const router: Router = express.Router();

let startupTable: Startup[] = [];

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
  });
});

router.param("fundId", async (req, res, next, fundId) => {
  try {
    if (await !fundIdExists(fundId)) {
      res.redirect("/"); // invalid query result for fundId
      return;
    }

    startupTable = await getStartupsForFund(fundId);

    next();
  } catch (error) {
    throw new Error(
      `Failed to query funds and startups for fund id ${fundId} with error: ${error}`
    );
  }
});

router.get("/table/values", (req, res) => {
  res.status(200).json(startupTable);
});

router.post("/startup", (req, res) => {
  res.setHeader("content-type", "application/javascript");
  res.redirect(`startup/${req.body.id}`);
});

let netProfitMarginTs: Object;
let cashFlowRateTs: Object;
let liquidityTs: Object;

router.get("/startup/:startupId/", (req, res) => {
  res.render("dashboard/fund/startup", {
    layout: "../views/layouts/fund.ejs",
    netProfitMargin: req.netProfitMargin,
    cashFlowRate: req.cashFlowRate,
    liquidity: req.liquidity,
  });
});

router.get("/chart/npm", (req, res) => {
  res.status(200).json(netProfitMarginTs);
});

router.get("/chart/cfr", (req, res) => {
  res.status(200).json(cashFlowRateTs);
});

router.get("/chart/liq", (req, res) => {
  res.status(200).json(liquidityTs);
});

router.param("startupId", async (req, res, next, startupId) => {
  try {
    const kpis = await getKpis(startupId);

    req.netProfitMargin = kpis[kpis.length - 1].netProfitMargin;
    req.cashFlowRate = kpis[kpis.length - 1].cashFlowRate;
    req.liquidity = kpis[kpis.length - 1].liquidity;

    let months: string[] = [];
    let netProfitMargin: number[] = [];
    let cashFlowRate: number[] = [];
    let liquidity: number[] = [];

    kpis.forEach((i) => {
      months.push(i.date.substring(0, 7));
      netProfitMargin.push(i.netProfitMargin);
      cashFlowRate.push(i.cashFlowRate);
      liquidity.push(i.liquidity);
    });

    netProfitMarginTs = {
      months: months,
      periodData: netProfitMargin,
    };
    cashFlowRateTs = {
      months: months,
      periodData: cashFlowRate,
    };
    liquidityTs = {
      months: months,
      periodData: liquidity,
    };

    next();
  } catch (error) {
    throw new Error(
      `Failed to query kpis for startup id ${startupId} with the following error: ${error}`
    );
  }
});

module.exports = router;
