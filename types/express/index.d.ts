import * as express from "express";

export {};

declare global {
  namespace Express {
    export interface Request {
      netProfitMargin?: any;
      cashFlowRate?: any;
      liquidity?: any;
      netProfitMarginTs?: any;
      cashFlowRateTs?: any;
      liquidityTs?: any;
    }
  }
}
