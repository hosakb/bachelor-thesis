declare global {
  namespace Express {
    export interface Request {
      user?: User;
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
    demoLoginToken?: string;
    startupId: string;
    fundId: string;
    startupTable: Startup[];
    phase: string;
    selectedStartup: string;
    startupName: string;
    capTable: Row[];
  }
}

export {};
