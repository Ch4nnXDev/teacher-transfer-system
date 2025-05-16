import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';
import {
  AuthenticatedRequest,
  SystemUser,
  AuthenticatedUser,
} from 'src/interfaces/auth.interface';
import { UserRole } from 'src/interfaces/entity.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No user found in request');
    }

    // Type-safe check for system authentication
    // Method 1: Check if user is SystemUser using type guard
    if (this.isSystemUser(user)) {
      return true;
    }

    // Method 2: Check the request flag
    if (request.isSystemAuth) {
      return true;
    }

    // Check if user has any of the required roles
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }

  // Type guard with properly typed parameter
  private isSystemUser(user: AuthenticatedUser): user is SystemUser {
    return 'isSystemAuth' in user && user.isSystemAuth === true;
  }
}
