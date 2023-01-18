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
const date_1 = require("../util/date");
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
        console.info(
          `Redirecting user ${
            (_c = req.user) === null || _c === void 0 ? void 0 : _c.id
          } to fund screen since no startup id is assigned.`
        );
        res.redirect("/startup");
      } else {
        console.info(
          `Redirecting user ${
            (_d = req.user) === null || _d === void 0 ? void 0 : _d.id
          } to login screen since no fund id or startup id are assigned.`
        );
        res.redirect("/");
      }
    } else {
      try {
        const trl = yield (0, startup_1.getTrl)(startupId);
        res.render("dashboard/startup/index", {
          layout: "../views/layouts/dashboard.ejs",
          dashboard: "startup",
          scripts: [
            "/js/gantt/frappe-gantt.min",
            "/js/chart/chart.min",
            "/js/startup",
          ],
          phase: yield (0, startup_1.getInvestmentPhase)(startupId),
          kpis: req.kpis,
          page: "dashboard",
          title: yield (0, startup_1.getStartupNameById)(startupId),
          name:
            ((_e = req.user) === null || _e === void 0
              ? void 0
              : _e.firstName) +
            " " +
            ((_f = req.user) === null || _f === void 0 ? void 0 : _f.lastName),
          trl: trl,
        });
      } catch (error) {
        console.error(
          `Failed to fetch startup data for startup with id ${startupId} due to:\n${error}.\nRedirecting to login screen.`
        );
        res.redirect("/");
      }
    }
  })
);
router.get("/chart/data", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const milestones = yield (0, startup_1.getMilestones)(
        req.session.startupId
      );
      const metrics = yield (0, startup_1.getMetrics)(req.session.startupId);
      const months = metrics.map((x) => {
        return (0, date_1.getMonth)(x.date);
      });
      const burnRate = metrics.map((x) => {
        return x.burnRate;
      });
      const cashRunway = metrics.map((x) => {
        return x.cashRunway;
      });
      const liquidity = metrics.map((x) => {
        return x.liquidity;
      });
      const chartData = {
        milestones,
        burnRate: {
          months,
          periodData: burnRate,
        },
        cashRunway: {
          months,
          periodData: cashRunway,
        },
        liquidity: {
          months,
          periodData: liquidity,
        },
      };
      res.status(200).json(chartData);
    } catch (error) {
      res.status(200).json([]);
    }
  })
);
router.put("/gantt/period", (req) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { taskId, start, end } = req.body;
    try {
      yield (0, startup_1.updateMilestoneDuration)(taskId, start, end);
    } catch (error) {
      console.error(`Failed to update Milestone duration due to ${error}.`);
    }
  })
);
router.put("/gantt/progress", (req) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { taskId, progress } = req.body;
    try {
      yield (0, startup_1.updateMilestoneProgress)(taskId, progress);
    } catch (error) {
      console.error(`Failed to update Milestone progress due to ${error}.`);
    }
  })
);
exports.default = router;
