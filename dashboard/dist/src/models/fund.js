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
exports.deleteFund =
  exports.getFundById =
  exports.insertNewFund =
  exports.getFundNameById =
  exports.getWeights =
  exports.updateWeights =
  exports.getFunds =
  exports.updateFund =
    void 0;
const db_1 = __importDefault(require("../config/db"));
const getFunds = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        "SELECT id, name, created_at, updated_at, investment_sector, fund_volume, hard_cap, next_closing, final_closing, type FROM fund",
        []
      );
      return result.rows.map((fund) => {
        return {
          id: fund.id,
          name: fund.name,
          createdAt: fund.created_at,
          updatedAt: fund.updated_at,
          investmentSector: fund.investment_sector,
          volume: fund.fund_volume,
          hardCap: fund.hard_cap,
          nextClosing: fund.next_closing,
          finalClosing: fund.final_closing,
          type: fund.type,
        };
      });
    } catch (err) {
      throw new Error(
        `Failed to query funds due to the following error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.getFunds = getFunds;
const getFundNameById = (fundId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query("SELECT name FROM fund WHERE id = $1", [
        fundId,
      ]);
      if (result.rowCount === 0) {
        throw new Error(`No fund found found for id ${fundId}.`);
      }
      return result.rows[0].name;
    } catch (err) {
      throw new Error(
        `Failed to query fund name for id ${fundId} due to the following error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.getFundNameById = getFundNameById;
const updateWeights = (fundId, weights) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query("UPDATE fund SET weights = $1 WHERE id = $2;", [
        JSON.stringify(weights),
        fundId,
      ]);
    } catch (err) {
      throw new Error(
        `Failed to update weighting for fund with id ${fundId} with the following error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.updateWeights = updateWeights;
const getWeights = (fundId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
      result = yield client.query("SELECT weights FROM fund WHERE id = $1;", [
        fundId,
      ]);
    } catch (err) {
      throw new Error(
        `Failed to query weighting for fund with id ${fundId} with the following error: ${err}`
      );
    } finally {
      client.release();
    }
    return result.rows[0].weights;
  });
exports.getWeights = getWeights;
const insertNewFund = (fund) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        `INSERT INTO fund (name, investment_sector, fund_volume, hard_cap, next_closing, final_closing, type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;`,
        [
          fund.name,
          fund.investmentSector,
          fund.volume,
          fund.hardCap,
          fund.nextClosing,
          fund.finalClosing,
          fund.type,
        ]
      );
      if (result.rows[0].id == undefined || result.rows[0].id == null) {
        throw new Error(
          `Expected value for id after inserting. Received ${result.rows[0].id}.`
        );
      }
      return result.rows[0].id;
    } catch (err) {
      throw new Error(`Failed insert new fund. Error: ${err}`);
    } finally {
      client.release();
    }
  });
exports.insertNewFund = insertNewFund;
const getFundById = (fundId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        "SELECT id, name, investment_sector, fund_volume, hard_cap, next_closing, final_closing, created_at, updated_at, type FROM fund WHERE id=$1",
        [fundId]
      );
      if (
        result.rows[0].type == "fund" &&
        (result.rows[0].name == undefined ||
          result.rows[0].name == null ||
          result.rows[0].investment_sector == undefined ||
          result.rows[0].investment_sector == null ||
          result.rows[0].fund_volume == undefined ||
          result.rows[0].fund_volume == null ||
          result.rows[0].hard_cap == undefined ||
          result.rows[0].hard_cap == null ||
          result.rows[0].next_closing == undefined ||
          result.rows[0].next_closing == null ||
          result.rows[0].final_closing == undefined ||
          result.rows[0].final_closing == null)
      ) {
        throw new Error(
          `Expected queried values for fund. Received ${result.rows[0].name}.`
        );
      } else if (
        result.rows[0].type == "stakeholder" &&
        (result.rows[0].name == undefined || result.rows[0].name == null)
      ) {
        throw new Error(
          `Expected queried values for stakeholder. Received ${result.rows[0].name}.`
        );
      }
      return {
        id: result.rows[0].id,
        name: result.rows[0].name,
        investmentSector: result.rows[0].investment_sector,
        hardCap: result.rows[0].hard_cap,
        volume: result.rows[0].fund_volume,
        nextClosing: result.rows[0].next_closing,
        finalClosing: result.rows[0].final_closing,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at,
        type: result.rows[0].type,
      };
    } catch (err) {
      throw new Error(
        `Failed to query fund infos with the following error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.getFundById = getFundById;
const updateFund = (fund) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query(
        "UPDATE fund SET name = $1, investment_sector = $2, fund_volume = $3, hard_cap = $4, next_closing = $5, final_closing = $6 WHERE id = $7;",
        [
          fund.name,
          fund.sector,
          fund.volume,
          fund.hardCap,
          fund.nextClosing,
          fund.finalClosing,
          fund.id,
        ]
      );
    } catch (err) {
      throw new Error(
        `Failed to update fund with id ${fund.id} with the following error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.updateFund = updateFund;
const deleteFund = (id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query("DELETE FROM fund WHERE id = $1;", [id]);
    } catch (err) {
      throw new Error(`Failed to delete fund with id ${id}. Error: ${err}`);
    } finally {
      client.release();
    }
  });
exports.deleteFund = deleteFund;
