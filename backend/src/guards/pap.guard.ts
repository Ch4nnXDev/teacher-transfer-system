import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedRequest } from 'src/interfaces/auth.interface';
import { UserRole } from 'src/interfaces/entity.interface';

@Injectable()
export class PapGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Check if PAP is enabled
    const papEnabled = this.configService.get<string>('PAP_ENABLED') === 'true';

    if (!papEnabled) {
      return false;
    }

    // Extract Basic Auth credentials
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return false;
    }

    try {
      // Decode base64 credentials
      const base64Credentials = authHeader.substring(6);
      const credentials = Buffer.from(base64Credentials, 'base64').toString(
        'ascii',
      );
      const [username, password] = credentials.split(':');

      // Validate against environment variables
      const papUsername = this.configService.get<string>('PAP_USERNAME');
      const papPassword = this.configService.get<string>('PAP_PASSWORD');

      if (username === papUsername && password === papPassword) {
        // Set PAP user object for downstream processing
        request.user = {
          userId: -1, // Special ID for PAP
          email: 'pap@system.local',
          role: UserRole.PAP,
        };
        return true;
      }

      return false;
    } catch {
      throw new UnauthorizedException('Invalid PAP credentials');
    }
  }
}
