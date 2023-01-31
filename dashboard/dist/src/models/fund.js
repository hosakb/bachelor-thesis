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
exports.getFundNameById = void 0;
const db_1 = __importDefault(require("../config/db"));
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
