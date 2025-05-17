import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'src/interfaces/jwt.interface';
import { UserService } from 'src/user/user.service';
import { RegularUser } from 'src/interfaces/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<RegularUser> {
    // NOTE: The JWT token is automatically verified by Passport before this method is called
    // If the token is invalid, expired, or has wrong signature, this method won't be reached

    try {
      // Use the existing UserService.findOne method which has proper relations and error handling
      const user = await this.userService.findOne(payload.sub);

      // The UserService.findOne already throws NotFoundException if user doesn't exist
      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException('User account is inactive');
      }

      // Return the user object in the format expected by AuthenticatedRequest
      return {
        userId: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      // If it's already an UnauthorizedException, re-throw it
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // For any other error (including NotFoundException from UserService.findOne)
      throw new UnauthorizedException('Invalid token or user not found');
    }
  }
}
