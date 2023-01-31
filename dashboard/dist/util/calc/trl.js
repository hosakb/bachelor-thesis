"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcTrlProd = void 0;
const calcTrlProd = (trlData) => {
  let trlCriticalitySum = 0;
  let criticalitySum = 0;
  for (const d of trlData) {
    trlCriticalitySum += d.criticality * d.trl;
    criticalitySum += d.criticality;
  }
  return Number((trlCriticalitySum / criticalitySum).toPrecision(3));
};
exports.calcTrlProd = calcTrlProd;
