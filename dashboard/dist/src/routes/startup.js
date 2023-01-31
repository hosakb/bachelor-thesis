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
exports.getStartupKpiRequestData = void 0;
const express_1 = __importDefault(require("express"));
// import { fetchBusinessCentralData } from "../api/business-central";
const startup_1 = require("../models/startup");
const router = express_1.default.Router();
router.get("/", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const startupId =
      (_a = req.user) === null || _a === void 0 ? void 0 : _a.startup;
    if (startupId === undefined) {
      if (
        ((_b = req.user) === null || _b === void 0 ? void 0 : _b.fund) !==
        undefined
      ) {
        console.log(
          `Redirecting user ${
            (_c = req.user) === null || _c === void 0 ? void 0 : _c.id
          } to fund screen since no startup id is assigned.`
        );
        res.redirect("/startup");
      } else {
        console.log(
          `Redirecting user ${
            (_d = req.user) === null || _d === void 0 ? void 0 : _d.id
          } to login screen since no fund id or startup id are assigned.`
        );
        res.redirect("/");
      }
    } else {
      try {
        // await fetchBusinessCentralData();
        yield getStartupKpiRequestData(req, startupId);
        res.render("dashboard/startup/index", {
          layout: "../views/layouts/startup.ejs",
          phase: yield (0, startup_1.getInvestmentPhase)(startupId),
          kpis: req.kpis,
          page: "dashboard",
          title: req.startupName,
          name:
            ((_e = req.user) === null || _e === void 0
              ? void 0
              : _e.firstName) +
            " " +
            ((_f = req.user) === null || _f === void 0 ? void 0 : _f.lastName),
        });
      } catch (error) {
        console.log(
          `Failed to fetch startup data for startup with id ${startupId} due to:\n${error}.\nRedirecting to login screen.`
        );
        res.redirect("/");
      }
    }
  })
);
function getStartupKpiRequestData(req, startupId) {
  return __awaiter(this, void 0, void 0, function* () {
    req.startupName = yield (0, startup_1.getStartupNameById)(startupId);
    const investmentPhaseKpis = yield (0, startup_1.getKpis)(startupId);
    const { phase, kpis } = investmentPhaseKpis;
    if (kpis.length === 0) {
      returnEmptyKpiRequestData(phase, req, kpis);
      return;
    }
    returnKpiRequestData(phase, req, kpis);
  });
}
exports.getStartupKpiRequestData = getStartupKpiRequestData;
function returnKpiRequestData(phase, req, kpis) {
  switch (phase) {
    case startup_1.InvestmentPhase.Seed:
      (req.phase = phase),
        (req.kpis = {
          numberOfEmployees: kpis[kpis.length - 1].numberOfEmployees,
          cashFlowRate: kpis[kpis.length - 1].cashFlowRate,
          liquidity: kpis[kpis.length - 1].liquidity,
        });
      toPeriodDataKpis(kpis, req);
      break;
    case startup_1.InvestmentPhase.Startup:
      (req.phase = phase),
        (req.kpis = {
          numberOfEmployees: kpis[kpis.length - 1].numberOfEmployees,
          cashFlowRate: kpis[kpis.length - 1].cashFlowRate,
          liquidity: kpis[kpis.length - 1].liquidity,
        });
      toPeriodDataKpis(kpis, req);
      break;
    case startup_1.InvestmentPhase.FirstStage:
      (req.phase = phase),
        (req.kpis = {
          numberOfEmployees: kpis[kpis.length - 1].numberOfEmployees,
          cashFlowRate: kpis[kpis.length - 1].cashFlowRate,
          liquidity: kpis[kpis.length - 1].liquidity,
        });
      toPeriodDataKpis(kpis, req);
      break;
    case startup_1.InvestmentPhase.SecondStage:
      (req.phase = phase),
        (req.kpis = {
          numberOfEmployees: kpis[kpis.length - 1].numberOfEmployees,
          cashFlowRate: kpis[kpis.length - 1].cashFlowRate,
          liquidity: kpis[kpis.length - 1].liquidity,
        });
      toPeriodDataKpis(kpis, req);
      break;
    case startup_1.InvestmentPhase.ThirdStage:
      (req.phase = phase),
        (req.kpis = {
          numberOfEmployees: kpis[kpis.length - 1].numberOfEmployees,
          cashFlowRate: kpis[kpis.length - 1].cashFlowRate,
          liquidity: kpis[kpis.length - 1].liquidity,
        });
      toPeriodDataKpis(kpis, req);
      break;
    case startup_1.InvestmentPhase.Final:
      (req.phase = phase),
        (req.kpis = {
          numberOfEmployees: kpis[kpis.length - 1].numberOfEmployees,
          cashFlowRate: kpis[kpis.length - 1].cashFlowRate,
          liquidity: kpis[kpis.length - 1].liquidity,
        });
      toPeriodDataKpis(kpis, req);
      break;
  }
}
function returnEmptyKpiRequestData(phase, req, kpis) {
  switch (phase) {
    case startup_1.InvestmentPhase.Seed:
      (req.phase = phase),
        (req.kpis = {
          numberOfEmployees: -1,
          cashFlowRate: -1,
          liquidity: -1,
        });
      toPeriodDataKpis(kpis, req);
      break;
    case startup_1.InvestmentPhase.Startup:
      req.kpis = {
        numberOfEmployees: -1,
        cashFlowRate: -1,
        liquidity: -1,
      };
      toPeriodDataKpis(kpis, req);
      break;
    case startup_1.InvestmentPhase.FirstStage:
      req.kpis = {
        numberOfEmployees: -1,
        cashFlowRate: -1,
        liquidity: -1,
      };
      toPeriodDataKpis(kpis, req);
      break;
    case startup_1.InvestmentPhase.SecondStage:
      req.kpis = {
        numberOfEmployees: -1,
        cashFlowRate: -1,
        liquidity: -1,
      };
      toPeriodDataKpis(kpis, req);
      break;
    case startup_1.InvestmentPhase.ThirdStage:
      req.kpis = {
        numberOfEmployees: -1,
        cashFlowRate: -1,
        liquidity: -1,
      };
      toPeriodDataKpis(kpis, req);
      break;
    case startup_1.InvestmentPhase.Final:
      req.kpis = {
        numberOfEmployees: -1,
        cashFlowRate: -1,
        liquidity: -1,
      };
      toPeriodDataKpis(kpis, req);
      break;
  }
  const numberOfEmployeesTs = {
    months: [],
    periodData: [],
  };
  const cashFlowRateTs = {
    months: [],
    periodData: [],
  };
  const liquidityTs = {
    months: [],
    periodData: [],
  };
  req.session.numberOfEmployeesTs = numberOfEmployeesTs;
  req.session.cashFlowRateTs = cashFlowRateTs;
  req.session.liquidityTs = liquidityTs;
}
function toPeriodDataKpis(kpis, req) {
  const months = [];
  const numberOfEmployees = [];
  const cashFlowRate = [];
  const liquidity = [];
  kpis.forEach((i) => {
    months.push(i.date);
    numberOfEmployees.push(i.numberOfEmployees);
    cashFlowRate.push(i.cashFlowRate);
    liquidity.push(i.liquidity);
  });
  const numberOfEmployeesTs = {
    months: months,
    periodData: numberOfEmployees,
  };
  const cashFlowRateTs = {
    months: months,
    periodData: cashFlowRate,
  };
  const liquidityTs = {
    months: months,
    periodData: liquidity,
  };
  req.session.numberOfEmployeesTs = numberOfEmployeesTs;
  req.session.cashFlowRateTs = cashFlowRateTs;
  req.session.liquidityTs = liquidityTs;
}
router.get("/chart/noe", (req, res) => {
  res.status(200).json(req.session.numberOfEmployeesTs);
});
router.get("/chart/cfr", (req, res) => {
  res.status(200).json(req.session.cashFlowRateTs);
});
router.get("/chart/liq", (req, res) => {
  res.status(200).json(req.session.liquidityTs);
});
exports.default = router;
// [{"date":"2022-09-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"numberOfEmployees":70},{"date":"2022-10-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"numberOfEmployees":70},{"date":"2022-11-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"numberOfEmployees":70},{"date":"2022-12-04T13:33:03.969Z","liquidity":60,"cashFlowRate":60,"numberOfEmployees":90},{"date":"2022-01-04T13:33:03.969Z","liquidity":40,"cashFlowRate":40,"numberOfEmployees":70},{"date":"2022-02-04T13:33:03.969Z","liquidity":50,"cashFlowRate":20,"numberOfEmployees":90},{"date":"2022-03-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"numberOfEmployees":70}, {"date":"2022-04-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"numberOfEmployees":70},{"date":"2022-05-04T13:33:03.969Z","liquidity":60,"cashFlowRate":60,"numberOfEmployees":90},{"date":"2022-06-04T13:33:03.969Z","liquidity":40,"cashFlowRate":40,"numberOfEmployees":70},{"date":"2022-07-04T13:33:03.969Z","liquidity":50,"cashFlowRate":20,"numberOfEmployees":90},{"date":"2022-08-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"numberOfEmployees":70}]
