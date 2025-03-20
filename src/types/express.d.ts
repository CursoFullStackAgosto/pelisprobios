import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      body: {
        user?: {
          userId: number;
          email: string;
          iat?: number;
          exp?: number;
        } & JwtPayload;
        [key: string]: any;
      }
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
  }
}

export {};