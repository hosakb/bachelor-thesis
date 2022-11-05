import { User } from "../../../models/users";

declare global {
  namespace Express {
    export interface Request {
      netProfitMargin?: number;
      cashFlowRate?: number;
      liquidity?: number;
      netProfitMarginTs?: number;
      cashFlowRateTs?: number;
      liquidityTs?: number;
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
