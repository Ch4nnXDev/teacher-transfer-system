import { Request } from 'express';
import { UserRole } from './entity.interface';

// Base interface for authenticated requests
export interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
    role: UserRole;
  };
  token?: string;
}

export interface AuthResponse {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
  };
  token: string;
}
