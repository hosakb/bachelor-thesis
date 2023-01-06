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
  // http://navsrv-2020.lutz.local:18058/BC180-Demo/ODataV4/Company('CRONUS%20AG')/G_LEntries?$filter=G_L_Account_Name eq 'Kommandit-Kapital'  -> Einzahlungen
  getCurrentEquity() {
    httpntlm.get(
      {
        url: this.baseUrl + this.company + "G_LEntries?$filter=G_L_Account_Name eq 'Kommandit-Kapital'",
        username: this.username,
        password: this.password,
        workstation: "anything",
        domain: "",
      },
      function (err, res) {
        if (err) return err;
        const value = JSON.parse(res.body).value;
        
        let currentEuqity = 0;

        for (const v of value) {
         currentEuqity += v.Credit_Amount;
        }
        console.log(currentEuqity)
      }
    );
  }
}

// const bc = new BusinessCentral(
//   "http://navsrv-2020.lutz.local:18058/BC180-Demo/ODataV4/",
//   "CRONUS AG",
//   "student",
//   "lutzGast_21!"
// ); // TODO: ENV
// bc.getCurrentEquity();
