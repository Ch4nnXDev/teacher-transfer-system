// JWT payload interface
export interface JwtPayload {
  sub: number; // userId
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
