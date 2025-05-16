import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SystemUser } from 'src/interfaces/auth.interface';
import { JwtPayload } from 'src/interfaces/jwt.interface';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy, 'bearer') {
  constructor(private jwtService: JwtService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super();
  }

  validate(token: string): SystemUser {
    try {
      // Verify the JWT token (same verification as JWT strategy)
      this.jwtService.verify<JwtPayload>(token);

      // Return properly typed SystemUser with bypass permissions
      const systemUser: SystemUser = {
        userId: -1,
        email: 'system@admin.local',
        role: 'system_admin',
        isSystemAuth: true,
      };
      return systemUser;
    } catch {
      throw new UnauthorizedException('Invalid bearer token');
    }
  }
}
