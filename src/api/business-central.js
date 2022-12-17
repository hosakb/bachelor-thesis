import httpntlm from "httpntlm";

export class BusinessCentral {
  baseUrl;
  company;
  username;
  password;

  constructor(baseUrl, company, username, password) {
    this.baseUrl = baseUrl;
    this.company = `Company('${company}')/`;
    this.username = username;
    this.password = password;
  }

  queryBusinessCentral() {
    httpntlm.get(
      {
        url: this.baseUrl + this.company + "ExcelTemplateBalanceSheet",
        username: this.username,
        password: this.password,
        workstation: "anything",
        domain: "",
      },
      function (err, res) {
        if (err) return err;
        const value = JSON.parse(res.body).value;
        // console.log(value)
      }
    );
  }
}
