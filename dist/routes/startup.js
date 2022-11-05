"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const startup_1 = require("../models/startup");
const router = express_1.default.Router();
let netProfitMarginTs;
let cashFlowRateTs;
let liquidityTs;
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
router.param("startupId", (req, res, next, startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const kpis = yield (0, startup_1.getKpis)(startupId);
    req.netProfitMargin = kpis[kpis.length - 1].netProfitMargin;
    req.cashFlowRate = kpis[kpis.length - 1].cashFlowRate;
    req.liquidity = kpis[kpis.length - 1].liquidity;
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
  })
);
exports.default = router;
// [{"date":"2022-09-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70},{"date":"2022-10-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70},{"date":"2022-11-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70},{"date":"2022-12-04T13:33:03.969Z","liquidity":60,"cashFlowRate":60,"netProfitMargin":90},{"date":"2022-01-04T13:33:03.969Z","liquidity":40,"cashFlowRate":40,"netProfitMargin":70},{"date":"2022-02-04T13:33:03.969Z","liquidity":50,"cashFlowRate":20,"netProfitMargin":90},{"date":"2022-03-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70}, {"date":"2022-04-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70},{"date":"2022-05-04T13:33:03.969Z","liquidity":60,"cashFlowRate":60,"netProfitMargin":90},{"date":"2022-06-04T13:33:03.969Z","liquidity":40,"cashFlowRate":40,"netProfitMargin":70},{"date":"2022-07-04T13:33:03.969Z","liquidity":50,"cashFlowRate":20,"netProfitMargin":90},{"date":"2022-08-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70}]
