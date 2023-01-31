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
exports.getExpertiseByStartup =
  exports.getFoundersByStartupId =
  exports.insertTrackRecord =
    void 0;
const db_1 = __importDefault(require("../config/db"));
const insertTrackRecord = (userId, expertise, ventures) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        `INSERT INTO track_record (expertise, ventures) VALUES ($1, $2) RETURNING id`,
        [expertise, JSON.stringify(ventures)]
      );
      const id = result.rows[0].id;
      yield client.query(`UPDATE users SET track_record = $1 WHERE id = $2`, [
        id,
        userId,
      ]);
    } catch (err) {
      throw new Error(
        `Failed to add track record user with id ${userId}. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.insertTrackRecord = insertTrackRecord;
const getFoundersByStartupId = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        "SELECT users.first_name, users.last_name, track_record.expertise, track_record.ventures FROM users JOIN track_record on users.track_record = track_record.id WHERE users.startup=$1",
        [startupId]
      );
      const founders = result.rows.map((founder) => {
        const ventures = founder.ventures;
        const startupFounder = {
          firstName: founder.first_name,
          lastName: founder.last_name,
          age: 1,
          trackRecord: {
            expertise: founder.expertise,
            ventures: ventures,
          },
        };
        return startupFounder;
      });
      return founders;
    } catch (err) {
      throw new Error(
        `Failed to query founders for startup id ${startupId} due to: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.getFoundersByStartupId = getFoundersByStartupId;
const getExpertiseByStartup = (startupId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        "SELECT track_record.expertise FROM users JOIN track_record on users.track_record = track_record.id WHERE users.startup=$1",
        [startupId]
      );
      return result.rows.map((row) => {
        return String(row.expertise);
      });
    } catch (err) {
      throw new Error(
        `Failed to query expertise of owners for startup id ${startupId} due to: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.getExpertiseByStartup = getExpertiseByStartup;
