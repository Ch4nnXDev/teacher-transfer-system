import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorator/roles/roles.decorator';
import { UnauthorizedAccessException } from 'src/exceptions/auth-exceptions/auth.exceptions';
import { RequestWithUser } from 'src/interfaces/request/request.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // Check if user and role exist
    if (!request.user || !request.user.role) {
      throw new UnauthorizedAccessException('Authentication required');
    }

    const hasRole = requiredRoles.some((role) => request.user.role === role);

    if (!hasRole) {
      throw new UnauthorizedAccessException(
        `Required role: ${requiredRoles.join(' or ')}`,
      );
    }

    return true;
  }
}
