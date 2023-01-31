"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRole = void 0;
const db_1 = __importDefault(require("../config/db"));
function getRole(email, cb) {
  db_1.default.query(
    `SELECT role FROM users
          WHERE email = $1`,
    [email],
    (err, result) => {
      if (err) {
        throw new Error(
          "Failed query the user role after login. Error: " + err
        );
      }
      if (result.rowCount > 1) {
        throw new Error("To many roles for user with mail: " + email);
      }
      if (result.rows[0].role === undefined) {
        throw new Error(
          "Failed query the user role after login. User role does not exist."
        );
      }
      cb(result.rows[0].role);
    }
  );
}
exports.getRole = getRole;
