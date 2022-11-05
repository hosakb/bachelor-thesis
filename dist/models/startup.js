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
exports.insertUser =
  exports.getKpis =
  exports.getStartups =
  exports.getStartupById =
    void 0;
const db_1 = __importDefault(require("../config/db"));
const getStartupById = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    let client = yield db_1.default.connect();
    try {
      let result = yield client.query(
        "SELECT id, name, stage, info FROM startup WHERE id=$1",
        [startupId]
      );
      const { id, name, stage, info } = result.rows[0];
      let share = info[0] === undefined ? "Not available" : info[0].share; //TODO: Fallback?
      let sector = info[0] === undefined ? "Not available" : info[0].sector; //TODO: Fallback?
      let totalInvestment =
        info[0] === undefined ? "Not available" : info[0].totalInvestment; //TODO: Fallback?
      let s = {
        id,
        name: name,
        stage: stage,
        share: share,
        sector: sector,
        totalInvestment: totalInvestment,
      };
      return s;
    } catch (err) {
      throw new Error(
        `Failed to query startup infos with the following error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.getStartupById = getStartupById;
const getKpis = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    let client = yield db_1.default.connect();
    try {
      let result = yield client.query(`SELECT kpis FROM startup WHERE id=$1`, [
        startupId,
      ]);
      let kpis = result.rows[0].kpis;
      return kpis;
    } catch (err) {
      throw new Error(`Failed to query kpis with the following error: ${err}`);
    } finally {
      client.release();
    }
  });
exports.getKpis = getKpis;
const getStartups = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    let client = yield db_1.default.connect();
    try {
      let result = yield client.query("SELECT name, stage FROM startup");
      if (result.rowCount === 0) {
        throw new Error(`No startups found found in db.`);
      }
      let startups = result.rows.map((row) => {
        return { id: row.id, name: row.name, stage: row.stage };
      });
      return startups;
    } catch (err) {
      throw new Error(
        `Failed to fetch all startups due to the following error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.getStartups = getStartups;
const insertUser = (firstName, lastName, email, hashedPassword) =>
  __awaiter(void 0, void 0, void 0, function* () {
    let client = yield db_1.default.connect();
    try {
      let result = yield client.query(
        `INSERT INTO users (first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, $5)`,
        [firstName, lastName, email, hashedPassword, ""]
      );
    } catch (err) {
      throw new Error(
        "Failed to create new user due to the following error: " + err
      );
    } finally {
      client.release();
    }
  });
exports.insertUser = insertUser;
