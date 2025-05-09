import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JwtPayload } from 'src/interfaces/jwt/jwt.interface';
import { InvalidTokenException } from 'src/exceptions/auth-exceptions/auth.exceptions';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key', // Use environment variable in production
    });
  }

  validate(payload: JwtPayload): {
    userId: number;
    email: string;
    role: string;
  } {
    if (!payload || !payload.sub || !payload.email || !payload.role) {
      throw new InvalidTokenException();
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
