declare namespace Express {
    export interface Request {
      user: { id: string; profile: string; tenantId:  number };
      APIAuth: { apiId: string; sessionId: number; tenantId: number };
    }

    export interface Application {
      rabbit: any;
    }
  }