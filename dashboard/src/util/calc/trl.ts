import { TrlData } from "../../models/startup";

export const calcTrlProd = (trlData: TrlData[]): number => {
  let trlCriticalitySum = 0;
  let criticalitySum = 0;

  for (const d of trlData) {
    trlCriticalitySum += d.criticality * d.trl;
    criticalitySum += d.criticality;
  }

  return Number((trlCriticalitySum / criticalitySum).toPrecision(3));
};
