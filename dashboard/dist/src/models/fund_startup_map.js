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
exports.getStartupIdsForFund =
  exports.updateRatingTotal =
  exports.updateFundStartups =
  exports.insertFundStartupRelation =
  exports.fundIdExists =
  exports.getStartupsForFund =
    void 0;
const db_1 = __importDefault(require("../config/db"));
const startup_1 = require("./startup");
const fundIdExists = (fundId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query("SELECT * FROM fund WHERE id=$1", [
        fundId,
      ]);
      if (result.rowCount > 1) {
        console.error(
          `Multiple funds received for fund id: ${fundId}. Expected one.`
        );
        return false;
      } else if (result.rowCount === 0) {
        console.error(`Fund with fund id ${fundId} does not exists.`);
        return false;
      } else {
        return true;
      }
    } catch (err) {
      throw new Error(
        `Failed to validate fund with id ${fundId} with the following error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.fundIdExists = fundIdExists;
const getStartupsForFund = (fundId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
      result = yield client.query(
        `SELECT startup_id, rating FROM fund_startup_map WHERE fund_id=$1`,
        [fundId]
      );
    } catch (err) {
      throw new Error(
        `Failed to query startup ids and their ratings for fund with id ${fundId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
    try {
      const startups = [];
      result.rows.forEach((row) =>
        __awaiter(void 0, void 0, void 0, function* () {
          const startup = yield (0, startup_1.getStartupTableRowById)(
            row.startup_id
          );
          const rating = row.rating;
          startups.push(Object.assign(Object.assign({}, startup), { rating }));
        })
      );
      return startups;
    } catch (err) {
      throw new Error(
        `Failed to query startups for fund with id ${fundId} with the following error: ${err}`
      );
    }
  });
exports.getStartupsForFund = getStartupsForFund;
const getStartupIdsForFund = (fundId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        `SELECT startup_id FROM fund_startup_map WHERE fund_id=$1`,
        [fundId]
      );
      return result.rows.map((row) => {
        return row.startup_id;
      });
    } catch (err) {
      throw new Error(
        `Failed to query startup ids fund with id ${fundId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.getStartupIdsForFund = getStartupIdsForFund;
const insertFundStartupRelation = (fundId, startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query(
        "INSERT INTO fund_startup_map (fund_id, startup_id) VALUES ($1, $2);",
        [fundId, startupId]
      );
    } catch (err) {
      throw new Error(
        `Failed to insert fund startup relationship for startup with id ${startupId} and fund with id ${fundId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.insertFundStartupRelation = insertFundStartupRelation;
const updateFundStartups = (fundId, startups) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query("DELETE FROM fund_startup_map WHERE fund_id = $1;", [
        fundId,
      ]);
      for (const startupId of startups) {
        yield client.query(
          "INSERT INTO fund_startup_map (fund_id, startup_id) VALUES ($1, $2);",
          [fundId, startupId]
        );
      }
    } catch (err) {
      throw new Error(
        `Failed to update startup fund relationship for fund with id: ${fundId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.updateFundStartups = updateFundStartups;
const updateRatingTotal = (ratingTotal, startupId, fundId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query(
        "UPDATE fund_startup_map SET rating = $1 WHERE fund_id = $2 AND startup_id = $3;",
        [ratingTotal, fundId, startupId]
      );
    } catch (err) {
      throw new Error(
        `Failed to update rating for startup_id: ${startupId} and fund_id: ${fundId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.updateRatingTotal = updateRatingTotal;
