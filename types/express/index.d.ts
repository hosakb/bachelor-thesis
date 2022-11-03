import * as express from "express";

import { Session } from "express-session";

import { User } from "../../models/users";

declare global {
  namespace Express {
    export interface Request {
      netProfitMargin?: any;
      cashFlowRate?: any;
      liquidity?: any;
      netProfitMarginTs?: any;
      cashFlowRateTs?: any;
      liquidityTs?: any;
      user?: User;
    }
  }
}

declare module "express-session" {
  export interface Session {
    startupId: string;
    fundId: string;
    admin: boolean;
  }
}
