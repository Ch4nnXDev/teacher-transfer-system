import { Request } from 'express';
import { UserRole } from './entity.interface';

// Base user type for regular users
export interface RegularUser {
  userId: number;
  email: string;
  role: UserRole;
}

// System user type for Basic/Bearer auth
export interface SystemUser {
  userId: -1;
  email: 'system@admin.local';
  role: 'system_admin';
  isSystemAuth: true;
}

// Union type that can be either regular user or system user
export type AuthenticatedUser = RegularUser | SystemUser;

// Updated interface with proper typing
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  token?: string;
  isSystemAuth?: boolean; // Flag for Basic/Bearer auth
}

// Create a specific interface for LocalAuth requests
export interface LocalAuthRequest extends Request {
  user: RegularUser; // LocalAuth only returns RegularUser
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
