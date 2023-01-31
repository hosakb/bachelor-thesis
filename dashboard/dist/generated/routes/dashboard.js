"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../config/db"));
const router = express_1.default.Router();
let netProfitMarginTs;
let cashFlowRateTs;
let liquidityTs;
router.get("/:startupId", (req, res) => {
  console.log(req.netProfitMargin);
  res.render("dashboard/index", {
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
  db_1.default.query(
    `SELECT kpis FROM startup WHERE id=$1`,
    [startupId],
    (err, result) => {
      if (err) {
        throw new Error(
          "Failed to query kpis with the following error: " + err
        );
      }
      let kpis = result.rows[0].kpis;
      req.netProfitMargin = kpis[kpis.length - 1].netProfitMargin;
      req.cashFlowRate = kpis[kpis.length - 1].cashFlowRate;
      req.liquidity = kpis[kpis.length - 1].liquidity;
      console.log(req.netProfitMargin);
      let months = [];
      let netProfitMargin = [];
      let cashFlowRate = [];
      let liquidity = [];
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
