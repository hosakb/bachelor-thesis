"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHashedPassword = void 0;
const httpntlm_1 = __importDefault(require("httpntlm"));
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
