import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PapGuard } from './pap.guard';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(
    private papGuard: PapGuard,
    private reflector: Reflector,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First check if PAP authentication is valid
    if (this.papGuard.canActivate(context)) {
      return true;
    }

    // If PAP fails, try JWT authentication
    try {
      const result = await super.canActivate(context);
      return result as boolean;
    } catch {
      // If both PAP and JWT fail, throw unauthorized
      throw new UnauthorizedException('Invalid authentication credentials');
    }
  }
}
