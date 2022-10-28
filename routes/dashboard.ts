import express, { Express, Request, Response, Router } from "express";
import pool from "../config/db";

const router: Router = express.Router();

interface Kpis {
  date: string;
  netProfitMargin: number;
  cashFlowRate: number;
  liquidity: number;
}

let netProfitMarginTs: Object;
1;
let cashFlowRateTs: Object;
let liquidityTs: Object;

router.get("/", (req, res) => {
  res.redirect("/dashboard/01041536-a76f-43a5-a3e1-c0e76f8acefa");
});

router.get("/:startupId", (req, res) => {
  // TMP (fund) charts
  res.render("dashboard/index", {
    netProfitMargin: 55,
    cashFlowRate: 33,
    liquidity: 66,
    page: "dashboard",
    erpOrFund: true,
  });
});

router.post("/startup/", (req, res) => {
  console.log(`${req.body.id}`);
  res.setHeader('content-type', 'application/javascript');
  res.redirect(`/dashboard/startup/${req.body.id}`);
});

router.get("/startup/:startupId/", (req, res) => {
  res.render("dashboard/startup", {
    netProfitMargin: req.netProfitMargin,
    cashFlowRate: req.cashFlowRate,
    liquidity: req.liquidity,
    page: "dashboard",
    erpOrFund: true,
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

router.param("startupId", (req, res, next, startupId) => {
  pool.query(
    `SELECT kpis FROM startup WHERE id=$1`,
    [startupId],
    (err, result) => {
      if (err) {
        throw new Error(
          "Failed to query kpis with the following error: " + err
        );
      }

      let kpis: Kpis[] = result.rows[0].kpis;

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
    }
  );
});

module.exports = router;
// [{"date":"2022-09-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70},{"date":"2022-10-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70},{"date":"2022-11-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70},{"date":"2022-12-04T13:33:03.969Z","liquidity":60,"cashFlowRate":60,"netProfitMargin":90},{"date":"2022-01-04T13:33:03.969Z","liquidity":40,"cashFlowRate":40,"netProfitMargin":70},{"date":"2022-02-04T13:33:03.969Z","liquidity":50,"cashFlowRate":20,"netProfitMargin":90},{"date":"2022-03-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70}, {"date":"2022-04-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70},{"date":"2022-05-04T13:33:03.969Z","liquidity":60,"cashFlowRate":60,"netProfitMargin":90},{"date":"2022-06-04T13:33:03.969Z","liquidity":40,"cashFlowRate":40,"netProfitMargin":70},{"date":"2022-07-04T13:33:03.969Z","liquidity":50,"cashFlowRate":20,"netProfitMargin":90},{"date":"2022-08-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70}]
