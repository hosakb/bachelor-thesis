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
exports.fundIdExists = exports.getStartupsForFund = void 0;
const db_1 = __importDefault(require("../config/db"));
const startup_1 = require("./startup");
const fundIdExists = (fundId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    let client = yield db_1.default.connect();
    try {
      let result = yield client.query("SELECT * FROM fund WHERE id=$1", [
        fundId,
      ]);
      if (result.rowCount > 1) {
        console.log(
          `Multiple funds received for fund id: ${fundId}. Expected one.`
        );
        return false;
      } else if (result.rowCount === 0) {
        console.log(`Fund with fund id ${fundId} does not exists.`);
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
    let client = yield db_1.default.connect();
    try {
      let result = yield client.query(
        `SELECT startup_id FROM fund_startup_map WHERE fund_id=$1`,
        [fundId]
      );
      let startups = [];
      for (const startup of result.rows) {
        startups.push(yield (0, startup_1.getStartupById)(startup.startup_id));
      }
      return startups;
    } catch (err) {
      throw new Error(
        `Failed to query startups for fund with id ${fundId} with the following error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.getStartupsForFund = getStartupsForFund;
