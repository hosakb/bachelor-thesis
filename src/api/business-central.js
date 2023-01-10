import httpntlm from "httpntlm";
import { promisify } from "util";

// lutzGast_21!

const httpntlmGetAsync = promisify(httpntlm.get);

export const getHashedPassword = (password) => {
  var lm = JSON.stringify(
    Array.prototype.slice.call(
      httpntlm.ntlm.create_LM_hashed_password(password),
      0
    )
  );
  var nt = JSON.stringify(
    Array.prototype.slice.call(
      httpntlm.ntlm.create_NT_hashed_password(password),
      0
    )
  );
  return { lm, nt };
};

export class BusinessCentral {
  baseUrl;
  company;
  username;
  lmPassword;
  ntPassword;

  constructor(company, username, ntPassword, lmPassword) {
    (this.baseUrl = process.env.BUSINESS_CENTRAL),
      (this.company = `Company('${company}')/`);
    this.username = username;
    this.ntPassword = new Buffer.from(ntPassword);
    this.lmPassword = new Buffer.from(lmPassword);
  }

  async getBalance() {
    try {
      const res = await httpntlmGetAsync({
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
  }
  async getShortTermLiabilities() {
    try {
      const res = await httpntlmGetAsync({
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
  }
}
