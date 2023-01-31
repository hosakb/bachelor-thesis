"use strict";
// import fetch from "node-fetch
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
// import btoa from "btoa";
// async function fetchBusinessCentralData() {
//   const url =
//     "http://navsrv-2020.lutz.local:18058/BC180-Demo/ODataV4/Company('CRONUS%20AG')/ExcelTemplateBalanceSheet";
//   const clientId = "student";
//   const clientSecret = "J7t3ClqUG28f/NyP3DF9mV+2i4lSTZ1rXUCsYmUgmd8=";
//   // const hostName = "http://navsrv-2020.lutz.local:18058/BC180-Demo/ODataV4/";
//   // const method = "Company('CRONUS AG')/ExcelTemplateBalanceSheet";
//   const authorizationBasic = Buffer.from(
//     clientId + ":" + clientSecret
//   ).toString("base64");
//   const response = await fetch(url, {
//     method: "GET",
//     redirect: "follow",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: "Basic " + btoa(authorizationBasic),
//     },
//   });
//   const body = await response.json();
//   console.log(body);
// }
// export { fetchBusinessCentralData };
/* eslint-disable no-console */
const httpntlm_1 = __importDefault(require("httpntlm"));
httpntlm_1.default.get(
  {
    url: "http://tfs2:8090/api/FlexPOS%20APS/odata/TimeExport%28StartDate=%272018-11-14%27,EndDate=%272018-11-14%27%20,PopulateTopParentColumns=null,GroupTimeByDateByUser=null,IncludeBillable=null%29",
    username: "your username",
    password: "your password",
    workstation: "anything",
    domain: "",
  },
  function (err, res) {
    if (err) return err;
    console.log(res.headers);
    console.log(res.body);
  }
);
