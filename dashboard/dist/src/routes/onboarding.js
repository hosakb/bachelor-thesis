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
    const { phase, productToMarket, timeToMarket, sector, investedCapital } =
      req.body.startupInfo;
    const startupInfo = {
      phase,
      productToMarket: productToMarket === "true",
      timeToMarket,
      sector,
      investedCapital,
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
          `Failed to onboard startup due to ${error}. Redirect to startup screen.`
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
    const {
      q1_1_1,
      q1_2_1,
      q1_2_2,
      q1_2_3,
      q1_2_4,
      q1_2_5,
      q1_2_6,
      q1_2_7,
      q1_2_8,
      q1_2_9,
      q1_2_10,
      q1_2_11,
      q1_2_12,
      q1_2_13,
      q1_2_14,
      q1_2_15,
      q1_2_16,
      q1_2_17,
      q1_2_18,
      q1_2_19,
      q1_2_20,
      q1_2_21,
      q1_2_22,
      q1_2_23,
      q1_2_24,
      q1_3_1,
      q1_3_2,
      q1_3_3,
      q1_3_4,
      q1_4_1,
      q1_4_2,
      q1_4_3,
      q1_4_4,
      q1_4_5,
      q1_4_6,
      q2_1_1,
      q2_1_2,
      q2_1_3,
      q2_1_4,
      q2_1_5,
      q2_1_6,
      q2_1_7,
      q2_1_8,
      q2_1_9,
      q2_1_10,
      q2_2_1,
      q2_2_2,
      q2_2_3,
      q2_3_1,
      q2_3_2,
      q2_3_3,
      q2_4_1,
      q2_4_2,
      q2_4_3,
      q2_4_4,
      q2_4_5,
      q2_4_6,
      q2_4_7,
      q2_5_1,
      q2_5_2,
      q2_5_3,
      q2_5_4,
      q2_5_5,
      q2_5_6,
      q3_1_1,
      q3_1_2,
      q3_1_3,
      q3_1_4,
      q4_1_1,
      q4_1_2,
      q5_1_1,
      q5_1_2,
      q5_1_3,
      q6_1_1,
      q6_1_2,
      q6_2_1,
      q6_2_2,
      q6_2_3,
      q6_2_4,
      q6_2_5,
      q6_3_1,
      q6_3_2,
      q6_3_3,
      q6_3_4,
      q6_4_1,
      q6_4_2,
      q6_4_3,
      q7_1_1,
      q7_1_2,
      q7_1_3,
      q7_1_4,
      q7_1_5,
      q7_1_6,
      q7_2_1,
      q7_2_2,
      q8_1_1,
      q8_1_2,
    } = req.body;
    const startupId =
      (_o = req.user) === null || _o === void 0 ? void 0 : _o.startup;
    if (startupId == undefined) {
      throw new Error("Failed to fetch startup id.");
    }
    try {
      const questionnaire = {
        q1_1_1: parseInt(q1_1_1),
        q1_2_1: parseInt(q1_2_1),
        q1_2_2: parseInt(q1_2_2),
        q1_2_3: parseInt(q1_2_3),
        q1_2_4: parseInt(q1_2_4),
        q1_2_5: parseInt(q1_2_5),
        q1_2_6: parseInt(q1_2_6),
        q1_2_7: parseInt(q1_2_7),
        q1_2_8: parseInt(q1_2_8),
        q1_2_9: parseInt(q1_2_9),
        q1_2_10: parseInt(q1_2_10),
        q1_2_11: parseInt(q1_2_11),
        q1_2_12: parseInt(q1_2_12),
        q1_2_13: parseInt(q1_2_13),
        q1_2_14: parseInt(q1_2_14),
        q1_2_15: parseInt(q1_2_15),
        q1_2_16: parseInt(q1_2_16),
        q1_2_17: parseInt(q1_2_17),
        q1_2_18: parseInt(q1_2_18),
        q1_2_19: parseInt(q1_2_19),
        q1_2_20: parseInt(q1_2_20),
        q1_2_21: parseInt(q1_2_21),
        q1_2_22: parseInt(q1_2_22),
        q1_2_23: parseInt(q1_2_23),
        q1_2_24: parseInt(q1_2_24),
        q1_3_1: parseInt(q1_3_1),
        q1_3_2: parseInt(q1_3_2),
        q1_3_3: parseInt(q1_3_3),
        q1_3_4: parseInt(q1_3_4),
        q1_4_1: parseInt(q1_4_1),
        q1_4_2: parseInt(q1_4_2),
        q1_4_3: parseInt(q1_4_3),
        q1_4_4: parseInt(q1_4_4),
        q1_4_5: parseInt(q1_4_5),
        q1_4_6: parseInt(q1_4_6),
        q2_1_1: parseInt(q2_1_1),
        q2_1_2: parseInt(q2_1_2),
        q2_1_3: parseInt(q2_1_3),
        q2_1_4: parseInt(q2_1_4),
        q2_1_5: parseInt(q2_1_5),
        q2_1_6: parseInt(q2_1_6),
        q2_1_7: parseInt(q2_1_7),
        q2_1_8: parseInt(q2_1_8),
        q2_1_9: parseInt(q2_1_9),
        q2_1_10: parseInt(q2_1_10),
        q2_2_1: parseInt(q2_2_1),
        q2_2_2: parseInt(q2_2_2),
        q2_2_3: parseInt(q2_2_3),
        q2_3_1: parseInt(q2_3_1),
        q2_3_2: parseInt(q2_3_2),
        q2_3_3: parseInt(q2_3_3),
        q2_4_1: parseInt(q2_4_1),
        q2_4_2: parseInt(q2_4_2),
        q2_4_3: parseInt(q2_4_3),
        q2_4_4: parseInt(q2_4_4),
        q2_4_5: parseInt(q2_4_5),
        q2_4_6: parseInt(q2_4_6),
        q2_4_7: parseInt(q2_4_7),
        q2_5_1: parseInt(q2_5_1),
        q2_5_2: parseInt(q2_5_2),
        q2_5_3: parseInt(q2_5_3),
        q2_5_4: parseInt(q2_5_4),
        q2_5_5: parseInt(q2_5_5),
        q2_5_6: parseInt(q2_5_6),
        q3_1_1: parseInt(q3_1_1),
        q3_1_2: parseInt(q3_1_2),
        q3_1_3: parseInt(q3_1_3),
        q3_1_4: parseInt(q3_1_4),
        q4_1_1: parseInt(q4_1_1),
        q4_1_2: parseInt(q4_1_2),
        q5_1_1: parseInt(q5_1_1),
        q5_1_2: parseInt(q5_1_2),
        q5_1_3: parseInt(q5_1_3),
        q6_1_1: parseInt(q6_1_1),
        q6_1_2: parseInt(q6_1_2),
        q6_2_1: parseInt(q6_2_1),
        q6_2_2: parseInt(q6_2_2),
        q6_2_3: parseInt(q6_2_3),
        q6_2_4: parseInt(q6_2_4),
        q6_2_5: parseInt(q6_2_5),
        q6_3_1: parseInt(q6_3_1),
        q6_3_2: parseInt(q6_3_2),
        q6_3_3: parseInt(q6_3_3),
        q6_3_4: parseInt(q6_3_4),
        q6_4_1: parseInt(q6_4_1),
        q6_4_2: parseInt(q6_4_2),
        q6_4_3: parseInt(q6_4_3),
        q7_1_1: parseInt(q7_1_1),
        q7_1_2: parseInt(q7_1_2),
        q7_1_3: parseInt(q7_1_3),
        q7_1_4: parseInt(q7_1_4),
        q7_1_5: parseInt(q7_1_5),
        q7_1_6: parseInt(q7_1_6),
        q7_2_1: parseInt(q7_2_1),
        q7_2_2: parseInt(q7_2_2),
        q8_1_1: parseInt(q8_1_1),
        q8_1_2: parseInt(q8_1_2),
      };
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
