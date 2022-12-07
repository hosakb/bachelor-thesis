import { InvestmentPhase, TimeSeriesKpis } from "../../../models/startup";

interface SeedKpis {
  netProfitMargin: number;
  cashFlowRate: number;
  liquidity: number;
}

interface StartupKpis {
  netProfitMargin: number;
  cashFlowRate: number;
  liquidity: number;
}

interface FirstStageKpis {
  netProfitMargin: number;
  cashFlowRate: number;
  liquidity: number;
}

interface SecondStageKpis {
  netProfitMargin: number;
  cashFlowRate: number;
  liquidity: number;
}

interface ThirdStageKpis {
  netProfitMargin: number;
  cashFlowRate: number;
  liquidity: number;
}

interface FinalStageKpis {
  netProfitMargin: number;
  cashFlowRate: number;
  liquidity: number;
}

export type Kpis =
  | SeedKpis
  | StartupKpis
  | FirstStageKpis
  | SecondStageKpis
  | ThirdStageKpis
  | FinalStageKpis;

interface Founder {
  firstName: string;
  lastName: string;
  age: number;
  trackRecord: TrackRecord;
}

interface TrackRecord {
  expertise: number;
  ventures: PreviousVenture[];
}

interface PreviousVenture {
  name: string;
  foundingDate: string;
  coFounders: number;
  lastValuation: number;
  inBusiness: boolean;
}

declare global {
  namespace Express {
    export interface Request {
      kpis: Kpis;
      phase: string;
      user?: User;
      startupName: string;
      fundName: string;
    }
    export interface User {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
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
    phase: InvestmentPhase;
    selectedStartup: string;
  }
}
