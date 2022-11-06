import { TimeSeriesKpis } from "../../../models/startup";

declare global {
  namespace Express {
    export interface Request {
      netProfitMargin?: number;
      cashFlowRate?: number;
      liquidity?: number;
      user?: User;
      startupName: string;
      fundName: string;
    }
    export interface User {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: string;
      created_at: string;
      updated_at: string;
      startup?: string;
      fund?: string;
    }
  }
}

declare module "express-session" {
  export interface Session {
    startupId: string;
    fundId: string;
    admin: boolean;
    netProfitMarginTs?: TimeSeriesKpis;
    cashFlowRateTs?: TimeSeriesKpis;
    liquidityTs?: TimeSeriesKpis;
    startupTable: Startup[];
  }
}
