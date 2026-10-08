import { TrlData } from "../../models/trl";

export const calcTrlProd = (trlData: TrlData[]): number | null => {
  let trlCriticalitySum = 0;
  let criticalitySum = 0;

  for (const d of trlData) {
    trlCriticalitySum += d.criticality * d.trl;
    criticalitySum += d.criticality;
  }

  if (criticalitySum === 0) {
    return null;
  }

  return Number((trlCriticalitySum / criticalitySum).toPrecision(3));
};
