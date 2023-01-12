import { InvestmentPhase, TimeSeriesKpis } from "../../../models/startup";
import { Expertise } from "../../../models/track_record";

interface SeedKpis {
  numberOfEmployees: number;
  cashFlowRate: number;
  liquidity: number;
}

interface StartupKpis {
  numberOfEmployees: number;
  cashFlowRate: number;
  liquidity: number;
}

interface FirstStageKpis {
  numberOfEmployees: number;
  cashFlowRate: number;
  liquidity: number;
}

interface SecondStageKpis {
  numberOfEmployees: number;
  cashFlowRate: number;
  liquidity: number;
}

interface ThirdStageKpis {
  numberOfEmployees: number;
  cashFlowRate: number;
  liquidity: number;
}

interface FinalStageKpis {
  numberOfEmployees: number;
  cashFlowRate: number;
  liquidity: number;
}

interface Expertise {
  name: string[];
  amount: number[];
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

interface Trl {
  product: string;
  trlProd: number;
  trlData: TrlData[];
}

interface Investor {
  id: string;
  name: string;
  type: string;
  email: string;
  number: string  | undefined;
  url: string  | undefined;
  country: string;
  notes: string  | undefined;
  contactDate: Date;
  status: string;
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
    numberOfEmployeesTs?: TimeSeriesKpis;
    cashFlowRateTs?: TimeSeriesKpis;
    liquidityTs?: TimeSeriesKpis;
    startupTable: Startup[];
    phase: InvestmentPhase;
    selectedStartup: string;
    expertise: Expertise;
    startupName: string;
    capTable: Row[];
    trl: Trl;
    investors: Investor[];
  }
}
