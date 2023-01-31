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
exports.getInvestors =
  exports.updateInvestorStatus =
  exports.updateInvestor =
  exports.insertInvestor =
  exports.deleteStartup =
  exports.deleteTrl =
  exports.getTrl =
  exports.updateStartupName =
  exports.updateMilestoneProgress =
  exports.updateMilestoneDuration =
  exports.updateTrl =
  exports.persistCoreTechnology =
  exports.persistMilestones =
  exports.persistTrlData =
  exports.persistInfo =
  exports.getAllStartups =
  exports.persistCapTable =
  exports.getTrlAvailable =
  exports.persistMetrics =
  exports.getStartups =
  exports.getStartupNameById =
  exports.getStartupById =
  exports.getQuestionnaire =
  exports.getQuestionnaireFilledOut =
  exports.getNewStartupById =
  exports.persistQuestionnaire =
  exports.getMilestones =
  exports.getMetrics =
  exports.getInvestmentPhase =
  exports.getInfoByStartupId =
  exports.getFirstStartupLoginById =
  exports.getCapTable =
  exports.getStartupIds =
  exports.insertNewStartup =
  exports.InvestmentPhase =
    void 0;
const db_1 = __importDefault(require("../config/db"));
const trl_1 = require("../util/calc/trl");
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
const insertNewStartup = (startupName) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        `INSERT INTO startup (name) VALUES ($1) RETURNING id;`,
        [startupName]
      );
      if (result.rows[0].id == undefined || result.rows[0].id == null) {
        throw new Error(
          `Expected value for id after inserting. Received ${result.rows[0].id}.`
        );
      }
      return result.rows[0].id;
    } catch (err) {
      throw new Error(`Failed insert new startup. Error: ${err}`);
    } finally {
      client.release();
    }
  });
exports.insertNewStartup = insertNewStartup;
const getStartupIds = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(`SELECT id FROM startup`, []);
      return result.rows.map((row) => {
        return row.id;
      });
    } catch (err) {
      throw new Error(`Failed query Startup Ids. Error: ${err}`);
    } finally {
      client.release();
    }
  });
exports.getStartupIds = getStartupIds;
const getFirstStartupLoginById = (startUpId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
      result = yield client.query(
        `SELECT info FROM startup
      WHERE id = $1`,
        [startUpId]
      );
      if (result.rowCount === 0) {
        throw new Error("No startup found for id: " + startUpId);
      }
    } catch (err) {
      throw new Error(
        `  "Failed query for first login for startup with email: ${startUpId}. Error:  ${err}`
      );
    } finally {
      client.release();
    }
    if (result.rows[0].info == undefined) {
      return true;
    } else {
      return false;
    }
  });
exports.getFirstStartupLoginById = getFirstStartupLoginById;
const getNewStartupById = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
      result = yield client.query("SELECT id, name FROM startup WHERE id=$1", [
        startupId,
      ]);
    } catch (err) {
      throw new Error(`Failed to query startup infos. Error: ${err}`);
    } finally {
      client.release();
    }
    const { id, name } = result.rows[0];
    const s = {
      id,
      name: name,
      stage: undefined,
      share: undefined,
      sector: undefined,
      totalInvestment: undefined,
    };
    return s;
  });
exports.getNewStartupById = getNewStartupById;
const getStartupById = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
      result = yield client.query(
        "SELECT id, name, stage, info FROM startup WHERE id=$1",
        [startupId]
      );
    } catch (err) {
      throw new Error(`Failed to query startup infos. Error: ${err}`);
    } finally {
      client.release();
    }
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
  });
exports.getStartupById = getStartupById;
const getStartups = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
      result = yield client.query("SELECT id, name, stage FROM startup");
    } catch (err) {
      throw new Error(
        `Failed to fetch all startups due to the following error: ${err}`
      );
    } finally {
      client.release();
    }
    if (result.rowCount === 0) {
      throw new Error(`No startups found found in db.`);
    }
    const startups = result.rows.map((row) => {
      return { id: row.id, name: row.name, stage: row.stage };
    });
    return startups;
  });
exports.getStartups = getStartups;
const getAllStartups = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        "SELECT name, stage, created_at, updated_at  FROM startup"
      );
      return result.rows.map((startup) => {
        return {
          name: startup.name,
          stage: startup.stage,
          createdAt: startup.created_at,
          updatedAt: startup.updated_at,
        };
      });
    } catch (err) {
      throw new Error(
        `Failed to fetch all startups due to the following error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.getAllStartups = getAllStartups;
const getStartupNameById = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
      result = yield client.query("SELECT name FROM startup WHERE id = $1", [
        startupId,
      ]);
      if (result.rowCount === 0) {
        throw new Error(`No startups found found for id ${startupId}.`);
      }
    } catch (err) {
      throw new Error(
        `Failed to query startup with id ${startupId} due to the following error: ${err}`
      );
    } finally {
      client.release();
    }
    return result.rows[0].name;
  });
exports.getStartupNameById = getStartupNameById;
const getInvestmentPhase = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
      result = yield client.query("SELECT stage FROM startup WHERE id=$1", [
        startupId,
      ]);
    } catch (err) {
      throw new Error(
        `Failed to query investment phase for startup id ${startupId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
    const phase = result.rows[0].stage;
    return phase;
  });
exports.getInvestmentPhase = getInvestmentPhase;
const persistCapTable = (capTable, startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query("UPDATE startup SET cap_table = $1 WHERE id = $2", [
        capTable,
        startupId,
      ]);
    } catch (err) {
      throw new Error(
        `Failed to persist cap table for startup id ${startupId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.persistCapTable = persistCapTable;
const updateStartupName = (name, startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query("UPDATE startup SET name = $1 WHERE id = $2", [
        name,
        startupId,
      ]);
    } catch (err) {
      throw new Error(
        `Failed to update startup name for startup id ${startupId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.updateStartupName = updateStartupName;
const getCapTable = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
      result = yield client.query(
        "SELECT cap_table FROM startup WHERE id = $1",
        [startupId]
      );
    } catch (err) {
      throw new Error(
        `Failed to fetch cap table for startup id ${startupId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
    const capTable = result.rows[0].cap_table;
    return capTable;
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
        `Failed to persist startup info for startup id ${startupId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.persistInfo = persistInfo;
const getInfoByStartupId = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
      result = yield client.query("SELECT info FROM startup WHERE id = $1", [
        startupId,
      ]);
    } catch (err) {
      throw new Error(
        `Failed to query startup info for startup id ${startupId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
    const info = result.rows[0].info;
    return info;
  });
exports.getInfoByStartupId = getInfoByStartupId;
const persistMilestones = (milestones, startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    console.log(milestones);
    try {
      yield client.query("DELETE FROM milestones WHERE startup_id = $1;", [
        startupId,
      ]);
      for (let i = 0; i < milestones.length; i++) {
        yield client.query(
          "INSERT INTO milestones (start_date, end_date, progress, startup_id, name, index) VALUES ($1, $2, $3, $4, $5, $6)",
          [
            milestones[i].start,
            milestones[i].end,
            milestones[i].progress,
            startupId,
            milestones[i].name,
            milestones[i].index,
          ]
        );
      }
    } catch (err) {
      throw new Error(
        `Failed to insert startup milestones for startup id ${startupId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.persistMilestones = persistMilestones;
const getMilestones = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
      result = yield client.query(
        "SELECT id, name, start_date, end_date, progress FROM milestones WHERE startup_id = $1",
        [startupId]
      );
    } catch (err) {
      throw new Error(
        `Failed to query milestones for startup id ${startupId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
    const milestones = result.rows.map((row) => {
      return {
        id: row.id,
        index: row.index,
        name: row.name,
        start: row.start_date,
        end: row.end_date,
        progress: row.progress,
      };
    });
    return milestones;
  });
exports.getMilestones = getMilestones;
const updateMilestoneProgress = (taskId, progress) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query("UPDATE milestones SET progress = $1 WHERE id = $2", [
        progress,
        taskId,
      ]);
    } catch (err) {
      throw new Error(
        `Failed to update milestones progress with id ${taskId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.updateMilestoneProgress = updateMilestoneProgress;
const updateMilestoneDuration = (taskId, start, end) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query(
        "UPDATE milestones SET start_date = $1, end_date = $2 WHERE id = $3",
        [start, end, taskId]
      );
    } catch (err) {
      throw new Error(
        `Failed to update milestone with id ${taskId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.updateMilestoneDuration = updateMilestoneDuration;
const getTrlAvailable = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
      result = yield client.query("SELECT id FROM trl WHERE startup_id = $1;", [
        startupId,
      ]);
    } catch (err) {
      throw new Error(
        `Failed to query availability of trl data for startup with id ${startupId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
    if (result.rowCount == 0) {
      return false;
    }
    return true;
  });
exports.getTrlAvailable = getTrlAvailable;
const getTrl = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
      result = yield client.query(
        "SELECT startup.product, trl.id, trl.technology, trl.trl, trl.criticality FROM trl JOIN startup ON trl.startup_id = startup.id WHERE startup.id = $1;",
        [startupId]
      );
    } catch (err) {
      throw new Error(
        `Failed to query trl data for startup with id ${startupId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
    const trlData = result.rows.map((trl) => {
      return {
        id: trl.id,
        technology: trl.technology,
        trl: trl.trl,
        criticality: trl.criticality,
      };
    });
    const trl = {
      product: result.rows[0].product,
      trlProd: (0, trl_1.calcTrlProd)(trlData),
      trlData: trlData,
    };
    return trl;
  });
exports.getTrl = getTrl;
const persistTrlData = (startupId, trlData) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      for (const trl of trlData) {
        yield client.query(
          "INSERT INTO trl (technology, trl, criticality, startup_id) VALUES ($1, $2, $3, $4);",
          [trl.technology, trl.trl, trl.criticality, startupId]
        );
      }
    } catch (err) {
      throw new Error(
        `Failed to persist trl data for startup with id ${startupId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.persistTrlData = persistTrlData;
const persistCoreTechnology = (startupId, product) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query("UPDATE startup SET product = $1 WHERE id = $2;", [
        product,
        startupId,
      ]);
    } catch (err) {
      throw new Error(
        `Failed to persist product for startup with id ${startupId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.persistCoreTechnology = persistCoreTechnology;
const updateTrl = (trlData) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query(
        "UPDATE trl SET technology = $1, trl = $2, criticality = $3 WHERE id = $4;",
        [trlData.technology, trlData.trl, trlData.criticality, trlData.id]
      );
    } catch (err) {
      throw new Error(`${err}`);
    } finally {
      client.release();
    }
  });
exports.updateTrl = updateTrl;
const deleteTrl = (id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query("DELETE FROM trl WHERE id = $1;", [id]);
    } catch (err) {
      throw new Error(`Failed to delete trl with id ${id}. Error: ${err}`);
    } finally {
      client.release();
    }
  });
exports.deleteTrl = deleteTrl;
const deleteStartup = (id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query("DELETE FROM startup WHERE id = $1;", [id]);
    } catch (err) {
      throw new Error(`Failed to delete startup with id ${id}. Error: ${err}`);
    } finally {
      client.release();
    }
  });
exports.deleteStartup = deleteStartup;
const persistQuestionnaire = (startupId, questionnaire) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query(
        "UPDATE startup SET questionnaire = $1 WHERE id = $2;",
        [JSON.stringify(questionnaire), startupId]
      );
    } catch (err) {
      throw new Error(
        `Failed to persist questionnaire data for startup with id ${startupId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.persistQuestionnaire = persistQuestionnaire;
const getQuestionnaire = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
      result = yield client.query(
        "SELECT questionnaire FROM startup WHERE id = $1;",
        [startupId]
      );
    } catch (err) {
      throw new Error(
        `Failed to query questionnaire data for startup with id ${startupId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
    return result.rows[0].questionnaire;
  });
exports.getQuestionnaire = getQuestionnaire;
const getQuestionnaireFilledOut = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
      result = yield client.query(
        "SELECT questionnaire FROM startup WHERE id = $1;",
        [startupId]
      );
    } catch (err) {
      throw new Error(
        `Failed to query questionnaire data for startup with id ${startupId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
    if (result.rows[0].questionnaire == undefined) {
      return false;
    } else {
      return true;
    }
  });
exports.getQuestionnaireFilledOut = getQuestionnaireFilledOut;
const getMetrics = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
      result = yield client.query(
        "SELECT date, burn_rate, cash_runway, liquidity FROM metrics WHERE startup = $1;",
        [startupId]
      );
    } catch (err) {
      throw new Error(
        `Failed to query metrics data for startup with id ${startupId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
    const metrics = result.rows.map((row) => {
      return {
        date: row.date,
        burnRate: row.burn_rate,
        cashRunway: row.cash_runway,
        liquidity: row.liquidity,
      };
    });
    return metrics;
  });
exports.getMetrics = getMetrics;
const persistMetrics = (metrics, startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query(
        "INSERT INTO metrics (date, burn_rate, cash_runway, liquidity, startup) VALUES ($1, $2, $3, $4, $5)",
        [
          metrics.date,
          metrics.burnRate,
          metrics.cashRunway,
          metrics.liquidity,
          startupId,
        ]
      );
    } catch (err) {
      throw new Error(
        `Failed to persist metrics data for startup with id ${startupId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.persistMetrics = persistMetrics;
const insertInvestor = (investor) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query(
        "INSERT INTO investors (name, type, email, number, url, country, notes, contact_date, startup_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [
          investor.name,
          investor.type,
          investor.email,
          investor.number,
          investor.url,
          investor.country,
          investor.notes,
          investor.contactDate,
          investor.startupId,
        ]
      );
    } catch (err) {
      throw new Error(
        `Failed to persist contacted investor startup with id ${investor.startupId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.insertInvestor = insertInvestor;
const getInvestors = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        "SELECT id, name, type, email, number, url, country, notes, contact_date, startup_id, status FROM investors WHERE startup_id = $1;",
        [startupId]
      );
      const investors = result.rows.map((row) => {
        return {
          id: row.id,
          name: row.name,
          type: row.type,
          email: row.email,
          number: row.number,
          url: row.url,
          country: row.country,
          notes: row.notes,
          contactDate: row.contact_date,
          status: row.status,
        };
      });
      return investors;
    } catch (err) {
      throw new Error(
        `Failed to contacted investors for startup with id ${startupId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.getInvestors = getInvestors;
const updateInvestor = (updatedInvestor) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query(
        "UPDATE investors SET email = $1, number = $2, url = $3, notes = $4  WHERE id = $5;",
        [
          updatedInvestor.email,
          updatedInvestor.notes,
          updatedInvestor.url,
          updatedInvestor.notes,
          updatedInvestor.id,
        ]
      );
    } catch (err) {
      throw new Error(
        `Failed to update contacted investors for with id ${updatedInvestor.id}. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.updateInvestor = updateInvestor;
const updateInvestorStatus = (status, id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query("UPDATE investors SET status = $1 WHERE id = $2;", [
        status,
        id,
      ]);
    } catch (err) {
      throw new Error(
        `Failed to update contacted investors status with id ${id}. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.updateInvestorStatus = updateInvestorStatus;
