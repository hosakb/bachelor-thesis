import express, { Router } from "express";
import pool from "../config/db";

const router: Router = express.Router();

interface Startup {
  id: string;
  name: string;
  stage: string;
  totalInvestment: number;
  share: number;
  sector: string;
}

let startupTable: Startup[] = [];

router.get("/", (req, res) => {
  console.log("-------");
  res.redirect("/fund/d7774c62-20be-4a7e-9cd6-3ab33cd71dbc");
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

router.param("fundId", (req, res, next, fundId) => {
  console.log(fundId);
  pool.query(
    `SELECT startup_id FROM fund_startup_map WHERE fund_id=$1`,
    [fundId],
    (err, result) => {
      if (err) {
        throw new Error(
          "Failed to query startup ids with the following error: " + err
        );
      }

      startupTable = [];

      for (const startup of result.rows) {
        pool.query(
          "SELECT id, name, stage, info FROM startup WHERE id=$1",
          [startup.startup_id],
          (err, result) => {
            if (err) {
              throw new Error(
                "Failed to query startup infos with the following error: " + err
              );
            }

            const { id, name, stage, info } = result.rows[0];
            let share = info[0].share;
            let sector = info[0].sector;
            let totalInvestment = info[0].totalInvestment;

            let s: Startup = {
              id,
              name: name,
              stage: stage,
              share: share,
              sector: sector,
              totalInvestment: totalInvestment,
            };

            startupTable.push(s);
            next();
          }
        );
      }
    }
  );
});

router.get("/table/values", (req, res) => {
  res.status(200).json(startupTable);
});

router.post("/startup", (req, res) => {
  res.setHeader("content-type", "application/javascript");
  res.redirect(`startup/${req.body.id}`);
});

interface Kpis {
  date: string;
  netProfitMargin: number;
  cashFlowRate: number;
  liquidity: number;
}

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
