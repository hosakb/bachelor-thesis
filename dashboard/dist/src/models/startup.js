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
exports.persistInfo =
  exports.getCapTable =
  exports.persistCapTable =
  exports.getInvestmentPhase =
  exports.updateKpis =
  exports.getKpis =
  exports.getStartups =
  exports.getStartupNameById =
  exports.getStartupById =
  exports.getFirstStartupLoginById =
  exports.InvestmentPhase =
    void 0;
const db_1 = __importDefault(require("../config/db"));
var InvestmentPhase;
(function (InvestmentPhase) {
  InvestmentPhase["Seed"] = "seed";
  InvestmentPhase["Startup"] = "startup";
  InvestmentPhase["FirstStage"] = "first_stage";
  InvestmentPhase["SecondStage"] = "second_stage";
  InvestmentPhase["ThirdStage"] = "third_stage";
  InvestmentPhase["Final"] = "final";
})(InvestmentPhase || (InvestmentPhase = {}));
exports.InvestmentPhase = InvestmentPhase;
const getFirstStartupLoginById = (startUpId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        `SELECT info FROM startup
      WHERE id = $1`,
        [startUpId]
      );
      if (result.rowCount === 0) {
        throw new Error("No startup found for id: " + startUpId);
      }
      const infoJson = result.rows[0].info;
      const info = JSON.parse(JSON.stringify(infoJson));
      if (info.length == 0) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      throw new Error(
        `  "Failed query for first login for startup with email: ${startUpId}. Error:  ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.getFirstStartupLoginById = getFirstStartupLoginById;
const getStartupById = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        "SELECT id, name, stage, info FROM startup WHERE id=$1",
        [startupId]
      );
      const { id, name, stage, info } = result.rows[0];
      const share = info[0] === undefined ? "Not available" : info[0].share; //TODO: Fallback?
      const sector = info[0] === undefined ? "Not available" : info[0].sector; //TODO: Fallback?
      const totalInvestment =
        info[0] === undefined ? "Not available" : info[0].totalInvestment; //TODO: Fallback?
      const s = {
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
const getStartups = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query("SELECT name, stage FROM startup");
      if (result.rowCount === 0) {
        throw new Error(`No startups found found in db.`);
      }
      const startups = result.rows.map((row) => {
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
const getStartupNameById = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        "SELECT name FROM startup WHERE id = $1",
        [startupId]
      );
      if (result.rowCount === 0) {
        throw new Error(`No startups found found for id ${startupId}.`);
      }
      return result.rows[0].name;
    } catch (err) {
      throw new Error(
        `Failed to query startup with id ${startupId} due to the following error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.getStartupNameById = getStartupNameById;
const getKpis = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        `SELECT stage FROM startup WHERE id=$1`,
        [startupId]
      );
      let investmentPhaseKpis;
      let kpis;
      let kpiResult;
      switch (result.rows[0].stage) {
        case InvestmentPhase.Seed:
          kpiResult = yield client.query(
            "SELECT seed_phase_kpis FROM startup WHERE id = $1",
            [startupId]
          );
          if (kpiResult.rowCount === 0) {
            throw new Error(
              `No seed phase kpis found for startup with startup id: ${startupId}.`
            );
          }
          kpis = kpiResult.rows[0].seed_phase_kpis;
          investmentPhaseKpis = {
            kpis,
            phase: InvestmentPhase.Seed,
          };
          break;
        case InvestmentPhase.Startup:
          kpiResult = yield client.query(
            "SELECT startup_phase_kpis FROM startup WHERE id = $1",
            [startupId]
          );
          if (kpiResult.rowCount === 0) {
            throw new Error(
              `No startup phase kpis found for startup with startup id: ${startupId}.`
            );
          }
          kpis = kpiResult.rows[0].startup_phase_kpis;
          investmentPhaseKpis = {
            kpis,
            phase: InvestmentPhase.Startup,
          };
          break;
        case InvestmentPhase.FirstStage:
          kpiResult = yield client.query(
            "SELECT first_stage_kpis FROM startup WHERE id = $1",
            [startupId]
          );
          if (kpiResult.rowCount === 0) {
            throw new Error(
              `No first stage phase kpis found for startup with startup id: ${startupId}.`
            );
          }
          kpis = kpiResult.rows[0].first_stage_kpis;
          investmentPhaseKpis = {
            kpis,
            phase: InvestmentPhase.FirstStage,
          };
          break;
        case InvestmentPhase.SecondStage:
          kpiResult = yield client.query(
            "SELECT second_stage_kpis FROM startup WHERE id = $1",
            [startupId]
          );
          if (kpiResult.rowCount === 0) {
            throw new Error(
              `No second stage phase kpis found for startup with startup id: ${startupId}.`
            );
          }
          kpis = kpiResult.rows[0].second_stage_kpis;
          investmentPhaseKpis = {
            kpis,
            phase: InvestmentPhase.SecondStage,
          };
          break;
        case InvestmentPhase.ThirdStage:
          kpiResult = yield client.query(
            "SELECT third_stage_kpis FROM startup WHERE id = $1",
            [startupId]
          );
          if (kpiResult.rowCount === 0) {
            throw new Error(
              `No third stage phase kpis found for startup with startup id: ${startupId}.`
            );
          }
          kpis = kpiResult.rows[0].third_stage_kpis;
          investmentPhaseKpis = {
            kpis,
            phase: InvestmentPhase.ThirdStage,
          };
          break;
        case InvestmentPhase.Final:
          kpiResult = yield client.query(
            "SELECT final_phase_kpis FROM startup WHERE id = $1",
            [startupId]
          );
          if (kpiResult.rowCount === 0) {
            throw new Error(
              `No final phase kpis found for startup with startup id: ${startupId}.`
            );
          }
          kpis = kpiResult.rows[0].final_phase_kpis;
          investmentPhaseKpis = {
            kpis,
            phase: InvestmentPhase.Final,
          };
          break;
        default:
          throw new Error("Failed to match startup investment phase.");
      }
      return investmentPhaseKpis;
    } catch (err) {
      throw new Error(`Failed to query kpis with the following error: ${err}`);
    } finally {
      client.release();
    }
  });
exports.getKpis = getKpis;
const updateKpis = (kpis, startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let phase;
    try {
      const result = yield client.query(
        `SELECT stage from startup WHERE id = $1`,
        [startupId]
      );
      if (result.rowCount != 1) {
        throw new Error(
          `Unable to identify phase for startup with id ${startupId}`
        );
      }
      phase = result.rows[0].stage;
      switch (phase) {
        case InvestmentPhase.Seed:
          yield client.query(
            `UPDATE startup SET updated_at = NOW(), seed_phase_kpis = seed_phase_kpis || $1::jsonb WHERE id = $2;`,
            [kpis, startupId]
          );
          break;
        case InvestmentPhase.Startup:
          yield client.query(
            `UPDATE startup SET updated_at = NOW(), startup_phase_kpis = startup_phase_kpis || $1::jsonb WHERE id = $2;`,
            [kpis, startupId]
          );
          break;
        case InvestmentPhase.FirstStage:
          yield client.query(
            `UPDATE startup SET updated_at = NOW(), first_stage_kpis = first_stage_kpis || $1::jsonb WHERE id = $2;`,
            [kpis, startupId]
          );
          break;
        case InvestmentPhase.SecondStage:
          yield client.query(
            `UPDATE startup SET updated_at = NOW(), second_stage_kpis = second_stage_kpis || $1::jsonb WHERE id = $2;`,
            [kpis, startupId]
          );
          break;
        case InvestmentPhase.ThirdStage:
          yield client.query(
            `UPDATE startup SET updated_at = NOW(), third_stage_kpis = third_stage_kpis || $1::jsonb WHERE id = $2;`,
            [kpis, startupId]
          );
          break;
        case InvestmentPhase.Final:
          yield client.query(
            `UPDATE startup SET updated_at = NOW(), final_phase_kpis = final_phase_kpis || $1::jsonb WHERE id = $2;`,
            [kpis, startupId]
          );
          break;
      }
    } catch (err) {
      throw new Error(
        `Failed to update ${phase} kpis due to the following error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.updateKpis = updateKpis;
const getInvestmentPhase = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        "SELECT stage FROM startup WHERE id=$1",
        [startupId]
      );
      const phase = result.rows[0].stage;
      return phase;
    } catch (err) {
      throw new Error(
        `Failed to query investment phase for startup id ${startupId} with the following error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.getInvestmentPhase = getInvestmentPhase;
const persistCapTable = (capTable, startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        "UPDATE startup SET cap_table = $1 WHERE id = $2",
        [capTable, startupId]
      );
    } catch (err) {
      throw new Error(
        `Failed to persist cap table for startup id ${startupId} with the following error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.persistCapTable = persistCapTable;
const getCapTable = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        "SELECT cap_table FROM startup WHERE id = $1",
        [startupId]
      );
      return JSON.parse(result.rows[0].cap_table);
    } catch (err) {
      throw new Error(
        `Failed to fetch cap table for startup id ${startupId} with the following error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.getCapTable = getCapTable;
const persistInfo = (startupInfo, startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query("UPDATE startup SET info = $1 WHERE id = $2", [
        JSON.stringify(startupInfo),
        startupId,
      ]);
    } catch (err) {
      throw new Error(
        `Failed to persist startup info for startup id ${startupId} with the following error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.persistInfo = persistInfo;
