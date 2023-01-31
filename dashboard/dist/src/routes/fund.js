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
const fund_1 = require("../models/fund");
const fund_startup_map_1 = require("../models/fund_startup_map");
const startup_1 = require("../models/startup");
const track_record_1 = require("../models/track_record");
const startup_2 = require("./startup");
const router = express_1.default.Router();
router.get("/", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const fundId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.fund;
    if (fundId === undefined) {
      if (
        ((_b = req.user) === null || _b === void 0 ? void 0 : _b.startup) !==
        undefined
      ) {
        console.log(
          `Redirecting user ${
            (_c = req.user) === null || _c === void 0 ? void 0 : _c.id
          } to startup screen since no fund id is assigned.`
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
        if (yield !(0, fund_startup_map_1.fundIdExists)(fundId)) {
          res.redirect("/"); // invalid query result for fundId
          return;
        }
        req.session.startupTable = yield (0,
        fund_startup_map_1.getStartupsForFund)(fundId);
        res.render("dashboard/fund/index", {
          layout: "../views/layouts/fund.ejs",
          kpiI: 55,
          kpiII: 33,
          kpiIII: 66,
          page: "dashboard",
          title: yield (0, fund_1.getFundNameById)(fundId),
          name:
            ((_e = req.user) === null || _e === void 0
              ? void 0
              : _e.firstName) +
            " " +
            ((_f = req.user) === null || _f === void 0 ? void 0 : _f.lastName),
        });
      } catch (error) {
        console.log(
          `Failed to fetch fund data for startup with id ${fundId} due to:\n${error}.\nRedirecting to login screen.`
        );
        res.redirect("/");
      }
    }
  })
);
router.get("/table/values", (req, res) => {
  res.status(200).json(req.session.startupTable);
});
router.post("/startup", (req, res) => {
  req.session.selectedStartup = req.body.id;
  res.setHeader("content-type", "application/javascript");
  res.redirect(`startup`);
});
router.get("/startup/founders", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h, _j;
    const startupId = req.session.selectedStartup;
    if (startupId === undefined) {
      console.log(
        `Redirecting user ${
          (_g = req.user) === null || _g === void 0 ? void 0 : _g.id
        } to fund screen since no selected startup was found.`
      );
      res.redirect("/fund/");
    }
    try {
      res.render("dashboard/founders/index", {
        layout: "../views/layouts/fund.ejs",
        title: req.startupName,
        name:
          ((_h = req.user) === null || _h === void 0 ? void 0 : _h.firstName) +
          " " +
          ((_j = req.user) === null || _j === void 0 ? void 0 : _j.lastName),
        page: "founder",
        founders: yield (0, track_record_1.getFoundersByStartupId)(startupId),
        startup: req.session.selectedStartup,
      });
    } catch (error) {
      console.log(
        `Failed to fetch startup request data for startup with id ${startupId} due to:\n${error}.\nRedirecting to fund dashboard.`
      );
      res.redirect("/fund/");
    }
  })
);
router.get("/startup/", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _k, _l, _m;
    const startupId = req.session.selectedStartup;
    if (startupId === undefined) {
      console.log(
        `Redirecting user ${
          (_k = req.user) === null || _k === void 0 ? void 0 : _k.id
        } to fund screen since no selected startup was found.`
      );
      res.redirect("/fund/");
    }
    try {
      yield (0, startup_2.getStartupKpiRequestData)(req, startupId);
      yield extractExpertise(startupId, req);
      const capTable = yield (0, startup_1.getCapTable)(startupId);
      res.render("dashboard/startup/index", {
        layout: "../views/layouts/fund.ejs",
        kpis: req.kpis,
        title: req.startupName,
        page: "dashboard",
        name:
          ((_l = req.user) === null || _l === void 0 ? void 0 : _l.firstName) +
          " " +
          ((_m = req.user) === null || _m === void 0 ? void 0 : _m.lastName),
        startup: req.session.selectedStartup,
        capTable,
      });
    } catch (error) {
      console.log(
        `Failed to fetch startup request data for startup with id ${startupId} due to:\n${error}.\nRedirecting to fund dashboard.`
      );
      res.redirect("/fund/");
    }
  })
);
router.get("/chart/noe", (req, res) => {
  res.status(200).json(req.session.numberOfEmployeesTs);
});
router.get("/chart/cfr", (req, res) => {
  res.status(200).json(req.session.cashFlowRateTs);
});
router.get("/chart/liq", (req, res) => {
  res.status(200).json(req.session.liquidityTs);
});
router.get("/chart/expertise", (req, res) => {
  res.status(200).json(req.session.expertise);
});
exports.default = router;
function extractExpertise(startupId, req) {
  return __awaiter(this, void 0, void 0, function* () {
    const expertiseValues = yield (0, track_record_1.getExpertiseByStartup)(
      startupId
    );
    const expertise = {
      name: [],
      amount: [],
    };
    for (const i of expertiseValues) {
      if (!expertise.name.includes(i)) {
        expertise.name.push(i);
        const amount = expertiseValues.filter((x) => x == i);
        expertise.amount.push(amount.length);
      }
    }
    req.session.expertise = expertise;
  });
}
