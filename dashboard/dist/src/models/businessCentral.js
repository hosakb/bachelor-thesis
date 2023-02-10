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
exports.getBusinessCentralUserByStartupId =
  exports.deleteBusinessCentralUser =
  exports.updateBusinessCentralUser =
  exports.insertBusinessCentralUser =
    void 0;
const db_1 = __importDefault(require("../config/db"));
const insertBusinessCentralUser = (user) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query(
        "INSERT INTO business_central (company, username, startup_id, lm_hashed_password, nt_hashed_password) VALUES ($1, $2, $3, $4, $5);",
        [
          user.company,
          user.username,
          user.startupId,
          user.lmHashedPassword,
          user.ntHashedPassword,
        ]
      );
    } catch (err) {
      throw new Error(
        `Failed to insert bc user for startup with id ${user.startupId} Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.insertBusinessCentralUser = insertBusinessCentralUser;
const updateBusinessCentralUser = (user) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query(
        "UPDATE business_central SET company = $1, username = $2, lm_hashed_password = $3, nt_hashed_password = $4 WHERE startup_id = $5",
        [
          user.company,
          user.username,
          user.lmHashedPassword,
          user.ntHashedPassword,
          user.startupId,
        ]
      );
    } catch (err) {
      throw new Error(
        `Failed to update bc user for startup id ${user.startupId} Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.updateBusinessCentralUser = updateBusinessCentralUser;
const deleteBusinessCentralUser = (id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query("DELETE FROM business_central WHERE id = $1;", [id]);
    } catch (err) {
      throw new Error(
        `Failed to delete business central user with id ${id}. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.deleteBusinessCentralUser = deleteBusinessCentralUser;
const getBusinessCentralUserByStartupId = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        "SELECT company, username FROM business_central WHERE startup_id = $1;",
        [startupId]
      );
      if (
        result.rows[0].company == undefined ||
        result.rows[0].username == undefined
      ) {
        throw new Error("No data found.");
      }
      return {
        company: result.rows[0].company,
        username: result.rows[0].username,
      };
    } catch (err) {
      throw new Error(
        `Failed to query business central user for startup id ${startupId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.getBusinessCentralUserByStartupId = getBusinessCentralUserByStartupId;
