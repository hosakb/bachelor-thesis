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
exports.emailRegistered =
  exports.getUserById =
  exports.getUserByEmail =
  exports.getUserRole =
  exports.Role =
    void 0;
const db_1 = __importDefault(require("../config/db"));
var Role;
(function (Role) {
  Role["Admin"] = "Admin";
  Role["Startup"] = "Startup";
  Role["Fund"] = "Fund";
})(Role || (Role = {}));
exports.Role = Role;
const getUserRole = (email) =>
  __awaiter(void 0, void 0, void 0, function* () {
    let client = yield db_1.default.connect();
    try {
      let result = yield client.query(
        `SELECT id, role, fund, startup FROM users
      WHERE email = $1`,
        [email]
      );
      if (result.rowCount > 1) {
        throw new Error("To many users with email: " + email);
      }
      if (result.rowCount === 0) {
        throw new Error("No user found for email: " + email);
      }
      const role = result.rows[0].role;
      if (role === Role.Startup) {
        return {
          id: result.rows[0].startup,
          role: Role.Startup,
        };
      } else if (role === Role.Fund) {
        return {
          id: result.rows[0].fund,
          role: Role.Fund,
        };
      } else {
        return {
          id: result.rows[0].id,
          role: Role.Admin,
        };
      }
    } catch (err) {
      throw new Error(
        `  "Failed query the users role after login for user with email: ${email}. Error:  ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.getUserRole = getUserRole;
const getUserByEmail = (email) =>
  __awaiter(void 0, void 0, void 0, function* () {
    let client = yield db_1.default.connect();
    try {
      let result = yield client.query(`SELECT * FROM users WHERE email = $1`, [
        email,
      ]);
      if (result.rowCount === 0) {
        throw new Error("No user found for email: " + email);
      }
      const user = result.rows[0];
      return user;
    } catch (err) {
      throw new Error(`Failed query user with email: ${email}. Error:  ${err}`);
    } finally {
      client.release();
    }
  });
exports.getUserByEmail = getUserByEmail;
const getUserById = (id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    let client = yield db_1.default.connect();
    try {
      let result = yield client.query(`SELECT * FROM users WHERE id = $1`, [
        id,
      ]);
      if (result.rowCount === 0) {
        throw new Error("No user found for id: " + id);
      }
      const user = result.rows[0];
      return user;
    } catch (err) {
      throw new Error(`Failed query user with id: ${id}. Error:  ${err}`);
    } finally {
      client.release();
    }
  });
exports.getUserById = getUserById;
const emailRegistered = (email) =>
  __awaiter(void 0, void 0, void 0, function* () {
    let client = yield db_1.default.connect();
    try {
      let result = yield client.query(`SELECT * FROM users WHERE email = $1`, [
        email,
      ]);
      if (result.rowCount === 0) {
        return false;
      }
      return true;
    } catch (err) {
      throw new Error(
        `Failed to check if ${email} is associated to a user. Error: ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.emailRegistered = emailRegistered;
