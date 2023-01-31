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
const date_1 = __importDefault(require("../util/date"));
const excel_1 = require("../util/excel");
const router = express_1.default.Router();
router.get("/", (req, res) => {
  var _a, _b, _c, _d, _e, _f;
  if (
    ((_a = req.user) === null || _a === void 0 ? void 0 : _a.startup) ===
    undefined
  ) {
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
    res.render("submit/index", {
      layout: "../views/layouts/startup.ejs",
      page: "submit",
      title: "Finvia",
      name:
        ((_e = req.user) === null || _e === void 0 ? void 0 : _e.firstName) +
        " " +
        ((_f = req.user) === null || _f === void 0 ? void 0 : _f.lastName),
    });
  }
});
router.post("/", excel_1.multerUpload.single("kpis"), (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
      const rows = yield (0, excel_1.uploadKpis)();
      const kpis = JSON.parse(JSON.stringify(rows[rows.length - 1]));
      kpis.date = kpis.date.substring(0, 10);
      kpis.cashFlowRate = Math.round(kpis.cashFlowRate * 100);
      kpis.numberOfEmployees = Math.round(kpis.numberOfEmployees * 100);
      kpis.liquidity = Math.round(kpis.liquidity * 100);
      res.render("submit/index", {
        layout: "../views/layouts/startup.ejs",
        page: "submit",
        kpis,
        title: "Finvia",
        name:
          ((_a = req.user) === null || _a === void 0 ? void 0 : _a.firstName) +
          " " +
          ((_b = req.user) === null || _b === void 0 ? void 0 : _b.lastName),
      });
      return;
    } catch (error) {
      console.log(
        `The following error occurred during upload of kpis. Redirecting to /submit ${error}`
      );
      res.redirect("/");
    }
  })
);
router.post("/reupload", (req, res) => {
  (0, excel_1.deleteSpreadsheets)();
  res.redirect("/submit");
});
router.post("/kpis", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const { date, numberOfEmployees, cashFlowRate, liquidity } = req.body.kpis;
    const kpis = {
      date: date,
      numberOfEmployees: numberOfEmployees,
      cashFlowRate: cashFlowRate,
      liquidity: liquidity,
    };
    (0, excel_1.deleteSpreadsheets)(); // TODO: error handling
    const startupId =
      (_c = req.user) === null || _c === void 0 ? void 0 : _c.startup;
    if (startupId === undefined) {
      console.log(
        `Redirecting to login screen since no startup is assigned to user with id ${
          (_d = req.user) === null || _d === void 0 ? void 0 : _d.id
        }`
      );
      res.redirect("/");
    } else {
      try {
        yield (0, startup_1.updateKpis)(kpis, startupId);
        res.redirect("/startup");
      } catch (error) {
        console.log(
          `Failed to update kpis due to ${error}. Redirect to startup screen.`
        );
        res.redirect("/startup");
      }
    }
  })
);
router.post("/kpi-form", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    const { numberOfEmployees, cashFlowRate, liquidity } = req.body;
    const kpis = {
      date: (0, date_1.default)(),
      numberOfEmployees: numberOfEmployees,
      cashFlowRate: cashFlowRate,
      liquidity: liquidity,
    };
    const startupId =
      (_e = req.user) === null || _e === void 0 ? void 0 : _e.startup;
    if (startupId === undefined) {
      console.log(
        `Redirecting to login screen since no startup is assigned to user with id ${
          (_f = req.user) === null || _f === void 0 ? void 0 : _f.id
        }`
      );
      res.redirect("/");
    } else {
      try {
        yield (0, startup_1.updateKpis)(kpis, req.session.startupId);
        res.redirect("/startup");
      } catch (error) {
        console.log(
          `Failed to update kpis due to ${error}. Redirect to startup screen.`
        );
        res.redirect("/startup");
      }
    }
  })
);
router.post(
  "/cap-table",
  excel_1.multerUpload.single("cap-table"),
  (req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      var _g, _h, _j;
      try {
        const rows = yield (0, excel_1.uploadCapTable)();
        const capTable = (0, excel_1.formatCapTable)(rows);
        const startupId =
          (_g = req.user) === null || _g === void 0 ? void 0 : _g.startup;
        if (startupId == undefined) {
          throw new Error("Failed to fetch startup id.");
        }
        yield (0,
        startup_1.persistCapTable)(JSON.stringify(capTable), startupId);
        res.render("submit/index", {
          layout: "../views/layouts/startup.ejs",
          page: "submit",
          title: "Finvia",
          name:
            ((_h = req.user) === null || _h === void 0
              ? void 0
              : _h.firstName) +
            " " +
            ((_j = req.user) === null || _j === void 0 ? void 0 : _j.lastName),
          capTable,
        });
        return;
      } catch (error) {
        console.log(
          `The following error occurred during upload of a cap table. Redirecting to /submit ${error}`
        );
        res.redirect("/");
      }
    })
);
exports.default = router;
