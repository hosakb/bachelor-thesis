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
exports.getFounders =
  exports.deleteUser =
  exports.updateUser =
  exports.getFirstUserLoginByEmail =
  exports.insertUser =
  exports.emailRegistered =
  exports.getLoginUserById =
  exports.getLoginUserByEmail =
  exports.getUserRole =
  exports.getUsers =
  exports.Role =
    void 0;
const db_1 = __importDefault(require("../config/db"));
var Role;
(function (Role) {
  Role["Admin"] = "admin";
  Role["Startup"] = "startup";
  Role["Fund"] = "fund";
  Role["Stakeholder"] = "stakeholder";
})(Role || (Role = {}));
exports.Role = Role;
const getUsers = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        "SELECT id, first_name, last_name, email, role, created_at, updated_at, startup, fund FROM users",
        []
      );
      const users = [];
      for (const user of result.rows) {
        if (user.startup !== null) {
          try {
            const result = yield client.query(
              "SELECT name FROM startup WHERE id = $1;",
              [user.startup]
            );
            const startup = result.rows[0].name;
            users.push({
              id: user.id,
              firstName: user.first_name,
              lastName: user.last_name,
              email: user.email,
              role: user.role,
              createdAt: user.created_at,
              updatedAt: user.updated_at,
              startup,
              fund: user.fund,
            });
          } catch (error) {
            throw new Error(
              `Failed to query startup name for startup id user.startup. Error: ${error}`
            );
          }
        } else if (user.fund !== null) {
          try {
            const result = yield client.query(
              "SELECT name FROM fund WHERE id = $1;",
              [user.fund]
            );
            const fund = result.rows[0].name;
            users.push({
              id: user.id,
              firstName: user.first_name,
              lastName: user.last_name,
              email: user.email,
              role: user.role,
              createdAt: user.created_at,
              updatedAt: user.updated_at,
              startup: user.startup,
              fund,
            });
          } catch (error) {
            throw new Error(
              `Failed to query startup name for startup id user.startup. Error: ${error}`
            );
          }
        } else {
          console.error(
            `Could not find assigned startup or fund for user with id ${user.id}`
          );
          users.push({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            role: user.role,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            startup: user.startup,
            fund: user.fund,
          });
        }
      }
      return users;
    } catch (err) {
      throw new Error(`Failed query the users. Error: ${err}`);
    } finally {
      client.release();
    }
  });
exports.getUsers = getUsers;
const getUserRole = (email) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
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
      } else if (role === Role.Stakeholder) {
        return {
          id: result.rows[0].fund,
          role: Role.Stakeholder,
        };
      } else if (role === Role.Admin) {
        return {
          id: result.rows[0].id,
          role: Role.Admin,
        };
      } else {
        throw new Error(`Unknown role found for user with email: ${email}.`);
      }
    } catch (err) {
      throw new Error(
        `Failed query the users role after login for user with email: ${email}. Error:  ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.getUserRole = getUserRole;
const getFirstUserLoginByEmail = (email) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        `SELECT track_record FROM users
      WHERE email = $1`,
        [email]
      );
      if (result.rowCount === 0) {
        throw new Error("No user found for email: " + email);
      }
      if (result.rows[0].track_record == null) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      throw new Error(
        `  "Failed query for first login for user with email: ${email}. Error:  ${err}`
      );
    } finally {
      client.release();
    }
  });
exports.getFirstUserLoginByEmail = getFirstUserLoginByEmail;
const getLoginUserByEmail = (email) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
      );
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
exports.getLoginUserByEmail = getLoginUserByEmail;
const getLoginUserById = (id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(`SELECT * FROM users WHERE id = $1`, [
        id,
      ]);
      if (result.rowCount === 0) {
        throw new Error("No user found for id: " + id);
      }
      const user = {
        id: result.rows[0].id,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        email: result.rows[0].email,
        password: result.rows[0].password,
        role: result.rows[0].role,
        created_at: result.rows[0].created_at,
        updated_at: result.rows[0].updated_at,
        startup: result.rows[0].startup,
        fund: result.rows[0].fund,
      };
      return user;
    } catch (err) {
      throw new Error(`Failed query user with id: ${id}. Error:  ${err}`);
    } finally {
      client.release();
    }
  });
exports.getLoginUserById = getLoginUserById;
const emailRegistered = (email) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
      );
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
const insertUser = (user) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      if (user.fund !== undefined) {
        yield client.query(
          `INSERT INTO users (first_name, last_name, email, password, role, fund) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            user.firstName,
            user.lastName,
            user.email,
            user.hashedPassword,
            user.role,
            user.fund,
          ]
        );
      } else {
        yield client.query(
          `INSERT INTO users (first_name, last_name, email, password, role, startup) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            user.firstName,
            user.lastName,
            user.email,
            user.hashedPassword,
            user.role,
            user.startup,
          ]
        );
      }
    } catch (err) {
      throw new Error("Failed to create new user due to: " + err);
    } finally {
      client.release();
    }
  });
exports.insertUser = insertUser;
const updateUser = (updatedUser) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query(
        `UPDATE users SET first_name = $1, last_name = $2, email = $3, password = $4 WHERE id = $5`,
        [
          updatedUser.firstName,
          updatedUser.lastName,
          updatedUser.email,
          updatedUser.hashedPassword,
          updatedUser.id,
        ]
      );
    } catch (err) {
      throw new Error(`Failed to update user with id: ${updatedUser.id}` + err);
    } finally {
      client.release();
    }
  });
exports.updateUser = updateUser;
const deleteUser = (id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      yield client.query(`DELETE FROM users WHERE id = $1`, [id]);
    } catch (err) {
      throw new Error(`Failed to delete user with id: ${id}` + err);
    } finally {
      client.release();
    }
  });
exports.deleteUser = deleteUser;
const getFounders = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
      const result = yield client.query(
        `SELECT id, first_name, last_name from users WHERE startup IS NOT NULL;`,
        []
      );
      return result.rows.map((founder) => {
        return {
          id: founder.id,
          firstName: founder.first_name,
          lastName: founder.last_name,
        };
      });
    } catch (err) {
      throw new Error(`Failed to query founders. Error:` + err);
    } finally {
      client.release();
    }
  });
exports.getFounders = getFounders;
