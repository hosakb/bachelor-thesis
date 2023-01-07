import { FinancialData } from "../../models/businessCentral";
import { Metrics } from "../../models/startup";

export async function calculateMetrics(
  financialData: FinancialData[]
): Promise<Metrics> {
  const burnRate = financialData[financialData.length - 1].balance - financialData[0].balance;
  let cashRunway = 0;
  if (burnRate != 0) {
    cashRunway = financialData[0].balance / burnRate;
  }
  const liquidity =
    financialData[0].balance / financialData[0].shortTermLiabilities;

  return {
    date: financialData[0].evaluatedAt,
    burnRate,
    cashRunway,
    liquidity,
  };
}
