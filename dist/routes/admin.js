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
const fund_1 = require("../models/fund");
const users_1 = require("../models/users");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const business_central_1 = require("../api/business-central");
const businessCentral_1 = require("../models/businessCentral");
const fund_startup_map_1 = require("../models/fund_startup_map");
const router = express_1.default.Router();
router.get("/", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
      res.render("admin/index", {
        layout: "../views/layouts/admin.ejs",
        scripts: [],
        page: "admin",
        title: "Admin Panel",
        name:
          ((_a = req.user) === null || _a === void 0 ? void 0 : _a.firstName) +
          " " +
          ((_b = req.user) === null || _b === void 0 ? void 0 : _b.lastName),
        funds: yield (0, fund_1.getFunds)(),
        startups: yield (0, startup_1.getAllStartups)(),
        users: yield (0, users_1.getUsers)(),
      });
    } catch (err) {
      throw new Error(
        `Failed to load all startups into the admin panel Error: ${err}`
      );
    }
  })
);
router.get("/users", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    try {
      res.render("admin/users", {
        layout: "../views/layouts/admin.ejs",
        scripts: ["/js/admin/users"],
        page: "users",
        title: "Admin Panel",
        name:
          ((_c = req.user) === null || _c === void 0 ? void 0 : _c.firstName) +
          " " +
          ((_d = req.user) === null || _d === void 0 ? void 0 : _d.lastName),
        funds: yield (0, fund_1.getFunds)(),
        startups: yield (0, startup_1.getAllStartups)(),
        users: yield (0, users_1.getUsers)(),
      });
    } catch (err) {
      throw new Error(
        `Failed to load all startups into the admin panel Error: ${err}`
      );
    }
  })
);
router.post("/get-user", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    try {
      const user = yield (0, users_1.getLoginUserById)(id);
      res.status(200).json({
        id: id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    } catch (err) {
      throw new Error(`Failed to query user for id ${id}. Error: ${err}`);
    }
  })
);
router.post("/email-taken", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
      const taken = yield (0, users_1.emailRegistered)(email);
      res.status(200).json(taken);
    } catch (err) {
      throw new Error(
        `Failed to check for existing email: ${email}. Error: ${err}`
      );
    }
  })
);
router.post("/add-user", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, password, role, fund, startup } =
      req.body;
    try {
      const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
      const newUser = {
        firstName,
        lastName,
        email,
        hashedPassword,
        role,
        startup,
        fund,
      };
      yield (0, users_1.insertUser)(newUser);
      res.status(200).json({
        firstName,
        lastName,
        email,
        password,
        role,
        startup,
        fund,
      });
    } catch (err) {
      throw new Error(
        `Failed to insert new user with email: ${email}. Error: ${err}`
      );
    }
  })
);
router.post("/edit-user", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { id, firstName, lastName, email, password } = req.body;
    try {
      const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
      const newUser = {
        id: id,
        firstName,
        lastName,
        email,
        hashedPassword,
      };
      yield (0, users_1.updateUser)(newUser);
      res.status(200).json();
    } catch (err) {
      throw new Error(
        `Failed to insert new user with email: ${email}. Error: ${err}`
      );
    }
  })
);
router.post("/delete-user", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    try {
      yield (0, users_1.deleteUser)(id);
      res.status(200).json();
    } catch (err) {
      throw new Error(
        `Failed to delete new user with id: ${id}. Error: ${err}`
      );
    }
  })
);
router.get("/startups", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    try {
      res.render("admin/startups", {
        layout: "../views/layouts/admin.ejs",
        scripts: ["/js/admin/startups"],
        page: "startups",
        title: "Admin Panel",
        name:
          ((_e = req.user) === null || _e === void 0 ? void 0 : _e.firstName) +
          " " +
          ((_f = req.user) === null || _f === void 0 ? void 0 : _f.lastName),
        founders: yield (0, users_1.getFounders)(),
        startups: yield (0, startup_1.getStartups)(),
      });
    } catch (err) {
      throw new Error(
        `Failed to load all startups into the admin panel Error: ${err}`
      );
    }
  })
);
router.post("/add-startup", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { name, bcUsername, bcPassword, bcCompany } = req.body;
    try {
      const startupId = yield (0, startup_1.insertNewStartup)(name);
      const { lm, nt } = (0, business_central_1.getHashedPassword)(bcPassword);
      const bcUser = {
        company: bcCompany,
        username: bcUsername,
        startupId,
        lmHashedPassword: lm,
        ntHashedPassword: nt,
      };
      yield (0, businessCentral_1.insertBusinessCentralUser)(bcUser);
      res.status(200).json();
    } catch (err) {
      throw new Error(`Failed to add new startup. Error: ${err}`);
    }
  })
);
router.post("/get-startup", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    try {
      const startup = yield (0, startup_1.getStartupById)(id);
      const bc = yield (0, businessCentral_1.getBusinessCentralUserByStartupId)(
        id
      );
      res.status(200).json({
        name: startup.name,
        company: bc.company,
        username: bc.username,
      });
    } catch (err) {
      throw new Error(`Failed to get startup for id: ${id}. Error: ${err}`);
    }
  })
);
router.post("/update-startup", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { id, name, bcUsername, bcPassword, bcCompany } = req.body;
    console.log(bcPassword);
    try {
      yield (0, startup_1.updateStartupName)(name, id);
      const { lm, nt } = (0, business_central_1.getHashedPassword)(bcPassword);
      const bcUser = {
        company: bcCompany,
        username: bcUsername,
        startupId: id,
        lmHashedPassword: lm,
        ntHashedPassword: nt,
      };
      yield (0, businessCentral_1.updateBusinessCentralUser)(bcUser);
      res.status(200).json();
    } catch (err) {
      throw new Error(`Failed to update startup. Error: ${err}`);
    }
  })
);
router.post("/delete-startup", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    try {
      yield (0, startup_1.deleteStartup)(id);
      yield (0, businessCentral_1.deleteBusinessCentralUser)(id);
      res.status(200).json();
    } catch (err) {
      throw new Error(`Failed to delete startup. Error: ${err}`);
    }
  })
);
router.get("/funds", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h;
    try {
      res.render("admin/funds", {
        layout: "../views/layouts/admin.ejs",
        scripts: ["/js/admin/fund"],
        page: "funds",
        title: "Admin Panel",
        name:
          ((_g = req.user) === null || _g === void 0 ? void 0 : _g.firstName) +
          " " +
          ((_h = req.user) === null || _h === void 0 ? void 0 : _h.lastName),
        funds: yield (0, fund_1.getFunds)(),
        startups: yield (0, startup_1.getStartups)(),
      });
    } catch (err) {
      throw new Error(
        `Failed to load all funds into the admin panel Error: ${err}`
      );
    }
  })
);
router.post("/add-fund", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const {
      fundName,
      investmentSector,
      hardCap,
      fundVolume,
      nextClosing,
      finalClosing,
      startups,
      type,
    } = req.body;
    const newFund = {
      name: fundName,
      investmentSector,
      hardCap,
      volume: fundVolume,
      nextClosing,
      finalClosing,
      type,
    };
    try {
      const fundId = yield (0, fund_1.insertNewFund)(newFund);
      for (const startupId of startups) {
        yield (0, fund_startup_map_1.insertFundStartupRelation)(
          fundId,
          startupId
        );
      }
      res.status(200).json();
    } catch (err) {
      throw new Error(`Failed to add new fund. Error: ${err}`);
    }
  })
);
router.post("/get-fund", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    try {
      const fund = yield (0, fund_1.getFundById)(id);
      const startups = yield (0, fund_startup_map_1.getStartupsForFund)(id);
      const fundPortfolio = {
        name: fund.name,
        sector: fund.investmentSector,
        volume: fund.volume,
        hardCap: fund.hardCap,
        finalClosing: fund.finalClosing,
        nextClosing: fund.nextClosing,
        startups: startups.map((startup) => {
          return startup.id;
        }),
        type: fund.type,
      };
      res.status(200).json(fundPortfolio);
    } catch (err) {
      throw new Error(`Failed to get fund for id: ${id}. Error: ${err}`);
    }
  })
);
router.post("/update-fund", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const {
      id,
      fundName,
      investmentSector,
      hardCap,
      fundVolume,
      nextClosing,
      finalClosing,
      fundsStartups,
    } = req.body;
    const updatedFund = {
      id,
      name: fundName,
      sector: investmentSector,
      hardCap,
      volume: fundVolume,
      nextClosing,
      finalClosing,
    };
    const startupIds = fundsStartups;
    try {
      yield (0, fund_1.updateFund)(updatedFund);
      yield (0, fund_startup_map_1.updateFundStartups)(id, startupIds);
      res.status(200).json();
    } catch (err) {
      throw new Error(`Failed to update fund. Error: ${err}`);
    }
  })
);
router.post("/delete-fund", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    try {
      yield (0, fund_1.deleteFund)(id);
      res.status(200).json();
    } catch (err) {
      throw new Error(`Failed to delete fund. Error: ${err}`);
    }
  })
);
exports.default = router;
