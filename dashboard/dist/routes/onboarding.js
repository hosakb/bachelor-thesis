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
const track_record_1 = require("../models/track_record");
const excel_1 = require("../util/excel");
const router = express_1.default.Router();
router.get("/startup", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    let newStartup;
    const startupId =
      (_a = req.user) === null || _a === void 0 ? void 0 : _a.startup;
    if (startupId == undefined) {
      throw new Error("Failed to fetch startup id.");
    }
    try {
      newStartup = yield (0, startup_1.getNewStartupById)(startupId);
      req.session.startupName = newStartup.name;
    } catch (e) {
      throw new Error("Failed to fetch startup from database.");
    }
    res.render("onboarding/startup", {
      layout: "../views/layouts/onboarding.ejs",
      title: req.session.startupName,
      name:
        ((_b = req.user) === null || _b === void 0 ? void 0 : _b.firstName) +
        " " +
        ((_c = req.user) === null || _c === void 0 ? void 0 : _c.lastName),
      startupName: req.session.startupName,
      scripts: ["/js/onboarding/startup"],
    });
  })
);
router.post(
  "/cap-table",
  excel_1.multerUpload.single("cap-table"),
  (req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        const rows = yield (0, excel_1.uploadCapTable)();
        const capTable = (0, excel_1.formatCapTable)(rows);
        req.session.capTable = capTable;
        res.json(JSON.stringify({ capTable: capTable }));
        return;
      } catch (error) {
        console.error(
          `The following error occurred during upload of a cap table. Redirecting to /submit ${error}`
        );
        res.redirect("/");
      }
    })
);
router.post("/reupload", (req, res) => {
  (0, excel_1.deleteSpreadsheets)();
  res.redirect("/submit");
});
router.post("/startup", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    const {
      phase,
      startDatePhase,
      dueDatePhase,
      progress,
      productToMarket,
      timeToMarket,
      sector,
    } = req.body.startupInfo;
    const startupInfo = {
      phase,
      startDatePhase,
      dueDatePhase,
      productToMarket,
      timeToMarket,
      progress,
      sector,
    };
    const startupId =
      (_d = req.user) === null || _d === void 0 ? void 0 : _d.startup;
    (0, excel_1.deleteSpreadsheets)(); // TODO: error handling
    if (startupId === undefined) {
      console.error(
        `Redirecting to login screen since no startup is assigned to user with id ${
          (_e = req.user) === null || _e === void 0 ? void 0 : _e.id
        }`
      );
      res.redirect("/");
    } else {
      try {
        yield (0, startup_1.persistCapTable)(
          JSON.stringify(req.session.capTable),
          startupId
        );
        yield (0, startup_1.persistInfo)(startupInfo, startupId);
        req.session.startupId = startupId;
        res.redirect("/onboarding/product");
      } catch (error) {
        console.error(
          `Failed to update kpis due to ${error}. Redirect to startup screen.`
        );
        res.redirect("/onboarding/startup");
      }
    }
  })
);
router.get("/product", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g, _h;
    const startupId =
      (_f = req.user) === null || _f === void 0 ? void 0 : _f.startup;
    if (startupId == undefined) {
      console.error("Failed to fetch startup id. Redirect to login screen.");
      res.redirect("/");
      return;
    }
    res.render("onboarding/product", {
      layout: "../views/layouts/onboarding.ejs",
      title: req.session.startupName,
      name:
        ((_g = req.user) === null || _g === void 0 ? void 0 : _g.firstName) +
        " " +
        ((_h = req.user) === null || _h === void 0 ? void 0 : _h.lastName),
      startupName: req.session.startupName,
      scripts: ["/js/onboarding/product"],
    });
  })
);
router.post("/trl", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    const { trlData, coreTechnology } = req.body;
    const newTrlData = JSON.parse(trlData);
    const startupId =
      (_j = req.user) === null || _j === void 0 ? void 0 : _j.startup;
    if (startupId == undefined) {
      throw new Error("Failed to fetch startup id.");
    }
    try {
      yield (0, startup_1.persistTrlData)(startupId, newTrlData);
      yield (0, startup_1.persistCoreTechnology)(startupId, coreTechnology);
      res.redirect("/onboarding/questionnaire");
    } catch (error) {
      console.error(
        `Failed to submit trl for startup with id ${startupId} due to: ${error}. Redirect to login screen.`
      );
      res.redirect("/");
    }
  })
);
router.get("/questionnaire", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _k, _l, _m;
    const startupId =
      (_k = req.user) === null || _k === void 0 ? void 0 : _k.startup;
    if (startupId == undefined) {
      console.error("Failed to fetch startup id. Redirect to login screen.");
      res.redirect("/");
      return;
    }
    res.render("onboarding/questionnaire", {
      layout: "../views/layouts/onboarding.ejs",
      title: req.session.startupName,
      name:
        ((_l = req.user) === null || _l === void 0 ? void 0 : _l.firstName) +
        " " +
        ((_m = req.user) === null || _m === void 0 ? void 0 : _m.lastName),
      startupName: req.session.startupName,
      scripts: ["/js/onboarding/questionnaire"],
    });
  })
);
router.post("/questionnaire", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _o;
    const body = req.body;
    const startupId =
      (_o = req.user) === null || _o === void 0 ? void 0 : _o.startup;
    if (startupId == undefined) {
      throw new Error("Failed to fetch startup id.");
    }
    try {
      Object.keys(body).forEach(function (el) {
        body[el] = parseInt(body[el]);
      });
      const questionnaire = body;
      yield (0, startup_1.persistQuestionnaire)(startupId, questionnaire);
      res.redirect("/onboarding/track-record");
    } catch (error) {
      console.error(
        `Failed to upload questionnaire for startup with id ${startupId} due to: ${error}. Redirect to login screen.`
      );
      res.redirect("/");
    }
  })
);
router.get("/track-record", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _p, _q, _r, _s, _t;
    let newStartup;
    const startupId =
      (_p = req.user) === null || _p === void 0 ? void 0 : _p.startup;
    if (startupId == undefined) {
      throw new Error("Failed to fetch startup id.");
    }
    try {
      newStartup = yield (0, startup_1.getNewStartupById)(startupId);
    } catch (e) {
      throw new Error("Failed to fetch startup from database.");
    }
    res.render("onboarding/track_record", {
      layout: "../views/layouts/onboarding.ejs",
      title: req.startupName,
      name:
        ((_q = req.user) === null || _q === void 0 ? void 0 : _q.firstName) +
        " " +
        ((_r = req.user) === null || _r === void 0 ? void 0 : _r.lastName),
      startupName: newStartup.name,
      founder:
        ((_s = req.user) === null || _s === void 0 ? void 0 : _s.firstName) +
        " " +
        ((_t = req.user) === null || _t === void 0 ? void 0 : _t.lastName),
      scripts: ["/js/onboarding/founder"],
    });
  })
);
router.post("/track-record", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _u, _v;
    const { expertise, ventures } = req.body.trackRecord;
    try {
      if (
        ((_u = req.user) === null || _u === void 0 ? void 0 : _u.id) ==
        undefined
      ) {
        console.error("Failed to fetch user id. Redirect to login screen.");
        res.redirect("/");
        return;
      }
      const userId = (_v = req.user) === null || _v === void 0 ? void 0 : _v.id;
      const previousVenture = ventures;
      yield (0,
      track_record_1.insertTrackRecord)(userId, expertise, previousVenture);
      const startupId = req.user.startup;
      if (startupId == undefined) {
        throw new Error("Failed to fetch startup id.");
      }
      req.session.startupId = startupId;
      res.redirect("/startup");
    } catch (error) {
      console.error(
        `Failed to submit track record due to: ${error}. Redirect to login screen.`
      );
      res.redirect("/");
    }
  })
);
exports.default = router;
