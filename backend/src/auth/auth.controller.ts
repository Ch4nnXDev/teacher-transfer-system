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
    return req.user;
  }

  @UseGuards(FlexibleAuthGuard)
  @Post('verify-token')
  verifyToken(@Request() req: AuthenticatedRequest) {
    return {
      valid: true,
      user: req.user,
      isSystemAuth: req.isSystemAuth || false,
    };
  }
}
