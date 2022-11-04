import express, { Router } from "express";
import pool from "../config/db";
import { getKpis } from "../models/startup";

const router: Router = express.Router();

let netProfitMarginTs: Object;
let cashFlowRateTs: Object;
let liquidityTs: Object;

router.get("/", (req, res) => {
  console.log("fund: " + req.session.fundId);
  console.log("startup: " + req.session.startupId);
  if (req.session.fundId !== undefined) {
    res.redirect("/fund/" + req.session.fundId);
  } else if (req.session.startupId !== undefined) {
    res.redirect("/startup/" + req.session.startupId);
  } else {
    res.redirect("/");
  }
});

router.get("/:startupId/", (req, res) => {
  res.render("dashboard/startup/index", {
    layout: "../views/layouts/startup.ejs",
    netProfitMargin: req.netProfitMargin,
    cashFlowRate: req.cashFlowRate,
    liquidity: req.liquidity,
    page: "dashboard",
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
});

export default router;

// [{"date":"2022-09-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70},{"date":"2022-10-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70},{"date":"2022-11-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70},{"date":"2022-12-04T13:33:03.969Z","liquidity":60,"cashFlowRate":60,"netProfitMargin":90},{"date":"2022-01-04T13:33:03.969Z","liquidity":40,"cashFlowRate":40,"netProfitMargin":70},{"date":"2022-02-04T13:33:03.969Z","liquidity":50,"cashFlowRate":20,"netProfitMargin":90},{"date":"2022-03-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70}, {"date":"2022-04-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70},{"date":"2022-05-04T13:33:03.969Z","liquidity":60,"cashFlowRate":60,"netProfitMargin":90},{"date":"2022-06-04T13:33:03.969Z","liquidity":40,"cashFlowRate":40,"netProfitMargin":70},{"date":"2022-07-04T13:33:03.969Z","liquidity":50,"cashFlowRate":20,"netProfitMargin":90},{"date":"2022-08-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70}]
