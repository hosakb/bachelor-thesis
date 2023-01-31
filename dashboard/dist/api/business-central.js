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
exports.BusinessCentral = exports.getHashedPassword = void 0;
const httpntlm_1 = __importDefault(require("httpntlm"));
const util_1 = require("util");
// lutzGast_21!
const httpntlmGetAsync = (0, util_1.promisify)(httpntlm_1.default.get);
const getHashedPassword = (password) => {
  var lm = JSON.stringify(
    Array.prototype.slice.call(
      httpntlm_1.default.ntlm.create_LM_hashed_password(password),
      0
    )
  );
  var nt = JSON.stringify(
    Array.prototype.slice.call(
      httpntlm_1.default.ntlm.create_NT_hashed_password(password),
      0
    )
  );
  return { lm, nt };
};
exports.getHashedPassword = getHashedPassword;
class BusinessCentral {
  constructor(company, username, ntPassword, lmPassword) {
    (this.baseUrl = process.env.BUSINESS_CENTRAL),
      (this.company = `Company('${company}')/`);
    this.username = username;
    this.ntPassword = new Buffer.from(ntPassword);
    this.lmPassword = new Buffer.from(lmPassword);
  }
  getBalance() {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const res = yield httpntlmGetAsync({
          url: this.baseUrl + this.company + "testtest?$filter=No eq '1331'",
          username: this.username,
          lm_password: this.lmPassword,
          nt_password: this.ntPassword,
          workstation: "anything",
          domain: "",
        });
        return JSON.parse(res.body).value[0].Balance;
      } catch (err) {
        throw new Error(
          `Failed to fetch balance for startup ${this.company} due to ${err}`
        );
      }
    });
  }
  getShortTermLiabilities() {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const res = yield httpntlmGetAsync({
          url:
            this.baseUrl +
            this.company +
            "testtest?$filter=No eq '1601' or No eq '1602'",
          username: this.username,
          lm_password: this.lmPassword,
          nt_password: this.ntPassword,
          workstation: "anything",
          domain: "",
        });
        let balance = 0;
        JSON.parse(res.body).value.forEach((val) => {
          balance += val.Balance;
        });
        return balance;
      } catch (err) {
        throw new Error(
          `Failed to fetch short term liabilities for startup ${this.company} due to ${err}`
        );
      }
    });
  }
}
exports.BusinessCentral = BusinessCentral;
