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
const excel_1 = require("../util/excel");
const router = express_1.default.Router();
router.get("/", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const trl = yield (0, startup_1.getTrl)(req.session.startupId);
    req.session.trl = trl;
    const investors = yield (0, startup_1.getInvestors)(req.session.startupId);
    req.session.investors = investors;
    const startupName = yield (0, startup_1.getStartupNameById)(
      req.session.startupId
    );
    req.session.startupName = startupName;
    res.render("submit/index", {
      layout: "../views/layouts/dashboard.ejs",
      dashboard: "startup",
      scripts: ["/js/submit"],
      page: "submit",
      title: startupName,
      name:
        ((_a = req.user) === null || _a === void 0 ? void 0 : _a.firstName) +
        " " +
        ((_b = req.user) === null || _b === void 0 ? void 0 : _b.lastName),
      trl: trl,
      investors,
    });
  })
);
// router.post("/", multerUpload.single("kpis"), async (req, res) => {
//   try {
//     const rows = await uploadKpis();
//     const kpis: Kpis = JSON.parse(JSON.stringify(rows[rows.length - 1]));
//     kpis.date = kpis.date.substring(0, 10);
//     kpis.cashFlowRate = Math.round(kpis.cashFlowRate * 100);
//     kpis.numberOfEmployees = Math.round(kpis.numberOfEmployees * 100);
//     kpis.liquidity = Math.round(kpis.liquidity * 100);
//     res.render("submit/index", {
//       layout: "../views/layouts/startup.ejs",
//       page: "submit",
//       kpis,
//       title: req.session.startupName,
//       name: req.user?.firstName + " " + req.user?.lastName,
//     });
//     return;
//   } catch (error) {
//     console.error(
//       `The following error occurred during upload of kpis. Redirecting to /submit ${error}`
//     );
//     res.redirect("/");
//   }
// });
router.post("/reupload", (req, res) => {
  (0, excel_1.deleteSpreadsheets)();
  res.redirect("/submit");
});
// router.post("/kpis", async (req, res) => {
//   const { date, numberOfEmployees, cashFlowRate, liquidity } = req.body.kpis;
//   const kpis: Kpis = {
//     date: date,
//     numberOfEmployees: numberOfEmployees,
//     cashFlowRate: cashFlowRate,
//     liquidity: liquidity,
//   };
//   deleteSpreadsheets(); // TODO: error handling
//   const startupId = req.user?.startup;
//   if (startupId === undefined) {
//     console.info(
//       `Redirecting to login screen since no startup is assigned to user with id ${req.user?.id}`
//     );
//     res.redirect("/");
//   } else {
//     try {
//       await updateKpis(kpis, startupId);
//       res.redirect("/startup");
//     } catch (error) {
//       console.error(
//         `Failed to update kpis due to ${error}. Redirect to startup screen.`
//       );
//       res.redirect("/startup");
//     }
//   }
// });
// router.post("/kpi-form", async (req, res) => {
//   const { numberOfEmployees, cashFlowRate, liquidity } = req.body;
//   const kpis: Kpis = {
//     date: getTodaysDate(),
//     numberOfEmployees: numberOfEmployees,
//     cashFlowRate: cashFlowRate,
//     liquidity: liquidity,
//   };
//   const startupId = req.user?.startup;
//   if (startupId === undefined) {
//     console.info(
//       `Redirecting to login screen since no startup is assigned to user with id ${req.user?.id}`
//     );
//     res.redirect("/");
//   } else {
//     try {
//       await updateKpis(kpis, req.session.startupId);
//       res.redirect("/startup");
//     } catch (error) {
//       console.error(
//         `Failed to update kpis due to ${error}. Redirect to startup screen.`
//       );
//       res.redirect("/startup");
//     }
//   }
// });
router.post(
  "/cap-table",
  excel_1.multerUpload.single("cap-table"),
  (req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      var _c, _d, _e;
      try {
        const rows = yield (0, excel_1.uploadCapTable)();
        const capTable = (0, excel_1.formatCapTable)(rows);
        const startupId =
          (_c = req.user) === null || _c === void 0 ? void 0 : _c.startup;
        if (startupId == undefined) {
          throw new Error("Failed to fetch startup id.");
        }
        yield (0,
        startup_1.persistCapTable)(JSON.stringify(capTable), startupId);
        res.render("submit/index", {
          layout: "../views/layouts/dashboard.ejs",
          dashboard: "startup",
          scripts: ["/js/submit"],
          page: "submit",
          title: req.session.startupName,
          name:
            ((_d = req.user) === null || _d === void 0
              ? void 0
              : _d.firstName) +
            " " +
            ((_e = req.user) === null || _e === void 0 ? void 0 : _e.lastName),
          capTable,
          trl: req.session.trl,
          investors: req.session.investors,
        });
        return;
      } catch (error) {
        console.error(
          `The following error occurred during upload of a cap table. Redirecting to /submit ${error}`
        );
        res.redirect("/submit");
      }
    })
);
router.post("/update-trl", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { id, technology, trl, criticality } = req.body.trlData;
    try {
      const trlData = {
        id,
        technology,
        trl,
        criticality,
      };
      yield (0, startup_1.updateTrl)(trlData);
    } catch (error) {
      console.error(
        `The following error occurred during update of a technology trl with id ${id}. Redirecting to /submit ${error}`
      );
      res.redirect("/submit");
    }
  })
);
router.post("/delete-trl", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body.id;
    try {
      yield (0, startup_1.deleteTrl)(id);
    } catch (error) {
      console.error(
        `The following error occurred during deletion of a technology trl with id ${id}. Redirecting to /submit ${error}`
      );
      res.redirect("/submit");
    }
  })
);
router.post("/add-trl", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { technology, trl, criticality } = req.body.trlData;
    try {
      const trlData = {
        id: "",
        technology,
        trl,
        criticality,
      };
      yield (0, startup_1.persistTrlData)(req.session.startupId, [trlData]);
      res.redirect("/submit");
    } catch (error) {
      console.error(
        `Failed to persist new trl startup with id ${req.session.startupId}. Error: ${error}. Redirecting to /submit `
      );
      res.redirect("/submit");
    }
  })
);
router.post("/new-investor", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { name, type, email, number, url, country, notes, contactDate } =
      req.body;
    try {
      const newInvestor = {
        name,
        type,
        email,
        number,
        url,
        country,
        notes,
        contactDate,
        startupId: req.session.startupId,
      };
      yield (0, startup_1.insertInvestor)(newInvestor);
      res.status(200).json();
    } catch (error) {
      console.error(
        `Failed to add new investors contact to startup with id ${req.session.startupId}. Error: ${error}. Redirecting to /submit ${error}`
      );
      res.status(500).json();
      res.redirect("/submit");
    }
  })
);
router.post("/update-investor-status", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { id, status } = req.body;
    try {
      yield (0, startup_1.updateInvestorStatus)(status, id);
      res.status(200).json();
    } catch (error) {
      console.error(
        `Failed to update investors status. Error: ${error}. Redirecting to /submit ${error}`
      );
      res.redirect("/submit");
    }
  })
);
router.post("/add-milestone", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const milestones = req.body.milestones;
    try {
      const existingMilestones = yield (0, startup_1.getMilestones)(
        req.session.startupId
      );
      const joinedMilestones = milestones.concat(
        existingMilestones.map((existingMilestone) => {
          return {
            name: existingMilestone.name,
            start: existingMilestone.start,
            end: existingMilestone.end,
            progress: existingMilestone.progress,
          };
        })
      );
      // const indexedMilestones: NewMilestone[] =
      joinedMilestones
        .sort((a, b) => {
          return new Date(b.start).getTime() - new Date(a.start).getTime();
        })
        .reverse();
      const indexedMilestones = [];
      for (let index = 0; index < joinedMilestones.length; index++) {
        indexedMilestones.push(Object.assign({ index }, joinedMilestones[0]));
      }
      yield (0,
      startup_1.persistMilestones)(indexedMilestones, req.session.startupId);
      res.status(200).json();
    } catch (error) {
      console.error(
        `Failed to persist milestone. Error: ${error}. Redirecting to /submit ${error}`
      );
      res.redirect("/submit");
    }
  })
);
exports.default = router;
