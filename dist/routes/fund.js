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
const fund_startup_map_1 = require("../models/fund_startup_map");
const startup_1 = require("../models/startup");
const router = express_1.default.Router();
let startupTable = [];
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
    kpiI: 55,
    kpiII: 33,
    kpiIII: 66,
    page: "dashboard",
    startup: false,
  });
});
router.param("fundId", (req, res, next, fundId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      if (yield !(0, fund_startup_map_1.fundIdExists)(fundId)) {
        res.redirect("/"); // invalid query result for fundId
        return;
      }
      startupTable = yield (0, fund_startup_map_1.getStartupsForFund)(fundId);
      next();
    } catch (error) {
      throw new Error(
        `Failed to query funds and startups for fund id ${fundId} with error: ${error}`
      );
    }
  })
);
router.get("/table/values", (req, res) => {
  res.status(200).json(startupTable);
});
router.post("/startup", (req, res) => {
  res.setHeader("content-type", "application/javascript");
  res.redirect(`startup/${req.body.id}`);
});
let netProfitMarginTs;
let cashFlowRateTs;
let liquidityTs;
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
router.param("startupId", (req, res, next, startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
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
    } catch (error) {
      throw new Error(
        `Failed to query kpis for startup id ${startupId} with the following error: ${error}`
      );
    }
  })
);
exports.default = router;
