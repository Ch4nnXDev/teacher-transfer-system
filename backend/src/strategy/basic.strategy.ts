import { BasicStrategy as Strategy } from 'passport-http';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SystemUser } from 'src/interfaces/auth.interface';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  constructor(private configService: ConfigService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super();
  }

  validate(username: string, password: string): SystemUser {
    const expectedUsername = this.configService.get<string>(
      'BASIC_AUTH_USERNAME',
    );
    const expectedPassword = this.configService.get<string>(
      'BASIC_AUTH_PASSWORD',
    );

    if (username === expectedUsername && password === expectedPassword) {
      // Return properly typed SystemUser
      const systemUser: SystemUser = {
        userId: -1,
        email: 'system@admin.local',
        role: 'system_admin',
        isSystemAuth: true,
      };
      return systemUser;
    }

    throw new UnauthorizedException('Invalid basic authentication credentials');
  }
}
