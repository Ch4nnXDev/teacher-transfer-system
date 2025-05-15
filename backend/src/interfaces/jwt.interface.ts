// JWT payload interface
export interface JwtPayload {
  sub: number; // userId
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// PAP credentials interface
export interface PapCredentials {
  username: string;
  password: string;
}
