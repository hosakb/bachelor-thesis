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
router.get("/", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    let newStartup;
    const startupId =
      (_a = req.user) === null || _a === void 0 ? void 0 : _a.startup;
    if (startupId == undefined) {
      throw new Error("Failed to fetch startup id.");
    }
    try {
      newStartup = yield (0, startup_1.getStartupById)(startupId);
    } catch (e) {
      throw new Error("Failed to fetch startup from database.");
    }
    res.render("onboarding/track_record", {
      layout: "../views/layouts/onboarding.ejs",
      title: req.startupName,
      name:
        ((_b = req.user) === null || _b === void 0 ? void 0 : _b.firstName) +
        " " +
        ((_c = req.user) === null || _c === void 0 ? void 0 : _c.lastName),
      startupName: newStartup.name,
      founder:
        ((_d = req.user) === null || _d === void 0 ? void 0 : _d.firstName) +
        " " +
        ((_e = req.user) === null || _e === void 0 ? void 0 : _e.lastName),
    });
  })
);
router.post("/track-record", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g;
    const { expertise, ventures } = req.body.trackRecord;
    try {
      if (
        ((_f = req.user) === null || _f === void 0 ? void 0 : _f.id) ==
        undefined
      ) {
        throw new Error("Failed use read user_id");
      }
      const userId = (_g = req.user) === null || _g === void 0 ? void 0 : _g.id;
      const previousVenture = ventures;
      yield (0,
      track_record_1.insertTrackRecord)(userId, expertise, previousVenture);
      res.redirect("/startup");
    } catch (error) {
      console.log(
        `Failed to submit track record due to: ${error}. Redirect to login screen.`
      );
      res.redirect("/onboarding");
    }
  })
);
router.get("/startup", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _h, _j, _k;
    let newStartup;
    const startupId =
      (_h = req.user) === null || _h === void 0 ? void 0 : _h.startup;
    if (startupId == undefined) {
      throw new Error("Failed to fetch startup id.");
    }
    try {
      newStartup = yield (0, startup_1.getStartupById)(startupId);
      req.session.startupName = newStartup.name;
    } catch (e) {
      throw new Error("Failed to fetch startup from database.");
    }
    res.render("onboarding/startup", {
      layout: "../views/layouts/onboarding.ejs",
      title: req.session.startupName,
      name:
        ((_j = req.user) === null || _j === void 0 ? void 0 : _j.firstName) +
        " " +
        ((_k = req.user) === null || _k === void 0 ? void 0 : _k.lastName),
      startupName: req.session.startupName,
    });
  })
);
router.post("/track-record", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _l, _m;
    const { expertise, ventures } = req.body.trackRecord;
    try {
      if (
        ((_l = req.user) === null || _l === void 0 ? void 0 : _l.id) ==
        undefined
      ) {
        throw new Error("Failed use read user_id");
      }
      const userId = (_m = req.user) === null || _m === void 0 ? void 0 : _m.id;
      const previousVenture = ventures;
      yield (0,
      track_record_1.insertTrackRecord)(userId, expertise, previousVenture);
      res.redirect("/startup");
    } catch (error) {
      console.log(
        `Failed to submit track record due to: ${error}. Redirect to login screen.`
      );
      res.redirect("/");
    }
  })
);
router.post(
  "/cap-table",
  excel_1.multerUpload.single("cap-table"),
  (req, res) =>
    __awaiter(void 0, void 0, void 0, function* () {
      var _o, _p;
      try {
        const rows = yield (0, excel_1.uploadCapTable)();
        const capTable = (0, excel_1.formatCapTable)(rows);
        req.session.capTable = capTable;
        res.render("onboarding/startup", {
          layout: "../views/layouts/onboarding.ejs",
          title: req.session.startupName,
          name:
            ((_o = req.user) === null || _o === void 0
              ? void 0
              : _o.firstName) +
            " " +
            ((_p = req.user) === null || _p === void 0 ? void 0 : _p.lastName),
          startupName: req.session.startupName,
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
router.post("/reupload", (req, res) => {
  (0, excel_1.deleteSpreadsheets)();
  res.redirect("/submit");
});
router.post("/startup", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _q, _r;
    const { phase, revenue, productToMarket, timeToMarket, sector } =
      req.body.startupInfo;
    const startupInfo = {
      phase,
      revenue,
      productToMarket,
      timeToMarket,
      sector,
    };
    const startupId =
      (_q = req.user) === null || _q === void 0 ? void 0 : _q.startup;
    (0, excel_1.deleteSpreadsheets)(); // TODO: error handling
    if (startupId === undefined) {
      console.log(
        `Redirecting to login screen since no startup is assigned to user with id ${
          (_r = req.user) === null || _r === void 0 ? void 0 : _r.id
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
        res.redirect("/onboarding");
      } catch (error) {
        console.log(
          `Failed to update kpis due to ${error}. Redirect to startup screen.`
        );
        res.redirect("/onboarding/startup");
      }
    }
  })
);
exports.default = router;
