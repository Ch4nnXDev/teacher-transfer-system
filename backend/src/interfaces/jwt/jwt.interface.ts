export interface JwtPayload {
  email: string;
  sub: number;
  role: string;
}

// Define a type for the user object from the JWT token
export interface JwtUser extends Omit<JwtPayload, 'sub'> {
  userId: number;
}
