import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/decorator/public.decorator';
import { ConfigService } from '@nestjs/config';
import {
  AuthenticatedRequest,
  SystemUser,
  AuthenticatedUser,
} from 'src/interfaces/auth.interface';
import { BasicAuthGuard } from './basic-auth.guard';
import { BearerAuthGuard } from './bearer-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class FlexibleAuthGuard implements CanActivate {
  private basicGuard: BasicAuthGuard;
  private bearerGuard: BearerAuthGuard;
  private jwtGuard: JwtAuthGuard;

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {
    this.basicGuard = new BasicAuthGuard();
    this.bearerGuard = new BearerAuthGuard();
    this.jwtGuard = new JwtAuthGuard();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Check which auth methods are enabled
    const basicAuthEnabled =
      this.configService.get<string>('BASIC_AUTH_ENABLED') === 'true';
    const bearerAuthEnabled =
      this.configService.get<string>('BEARER_AUTH_ENABLED') === 'true';

    // Try different authentication methods in order
    let lastError: Error | null = null;

    // Try Basic Auth if enabled
    if (basicAuthEnabled) {
      try {
        const result = await this.basicGuard.canActivate(context);
        if (result) {
          const request = context
            .switchToHttp()
            .getRequest<AuthenticatedRequest>();
          if (this.isSystemUser(request.user)) {
            request.isSystemAuth = true;
          }
          return true;
        }
      } catch (error) {
        lastError = error as Error;
      }
    }

    // Try Bearer Auth if enabled
    if (bearerAuthEnabled) {
      try {
        const result = await this.bearerGuard.canActivate(context);
        if (result) {
          const request = context
            .switchToHttp()
            .getRequest<AuthenticatedRequest>();
          if (this.isSystemUser(request.user)) {
            request.isSystemAuth = true;
          }
          return true;
        }
      } catch (error) {
        lastError = error as Error;
      }
    }

    // Try JWT Auth (always enabled)
    try {
      const result = await this.jwtGuard.canActivate(context);
      if (result) {
        return true;
      }
    } catch (error) {
      lastError = error as Error;
    }

    // If all methods failed, throw the last error or a generic one
    throw lastError || new UnauthorizedException('Authentication failed');
  }

  // Type guard to check if user is SystemUser
  private isSystemUser(user: AuthenticatedUser): user is SystemUser {
    return 'isSystemAuth' in user && user.isSystemAuth === true;
  }
}
