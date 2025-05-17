import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';
import { FlexibleAuthGuard } from 'src/guards/flexible-auth.guard';
import {
  AuthenticatedRequest,
  LocalAuthRequest,
} from 'src/interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: LocalAuthRequest) {
    // LocalStrategy validates user and attaches it to request
    // The user object contains the validated user data (without password)
    // Since this comes from LocalAuthGuard, we know it's a RegularUser
    return this.authService.login(req.user);
  }

  @UseGuards(FlexibleAuthGuard)
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    // Only return profile for regular users (JWT auth)
    // System auth (Basic/Bearer) should not use this endpoint
    if (req.isSystemAuth) {
      return {
        message:
          'System authentication detected. Use system endpoints instead.',
        systemAuth: true,
      };
    }
    return req.user;
  }

  @UseGuards(FlexibleAuthGuard)
  @Post('verify-token')
  verifyToken(@Request() req: AuthenticatedRequest) {
    // Different response based on auth type
    if (req.isSystemAuth) {
      return {
        valid: true,
        authType: 'system',
        message: 'System authentication successful',
      };
    }

    // For JWT tokens, return full verification info
    return {
      valid: true,
      authType: 'jwt',
      user: req.user,
      isSystemAuth: false,
    };
  }

  // New endpoint specifically for system auth verification
  @UseGuards(FlexibleAuthGuard)
  @Get('system/verify')
  verifySystemAuth(@Request() req: AuthenticatedRequest) {
    if (!req.isSystemAuth) {
      return {
        valid: false,
        message:
          'This endpoint requires system authentication (Basic or Bearer)',
      };
    }

    return {
      valid: true,
      message: 'System authentication verified',
      timestamp: new Date().toISOString(),
    };
  }
}
