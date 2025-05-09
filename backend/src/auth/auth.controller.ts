import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LoginUserDto } from 'src/dto/user.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { ArrayInputException } from 'src/exceptions/validation-exceptions/validation.exceptions';
import { RequestWithUser } from 'src/interfaces/request/request.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    if (Array.isArray(loginUserDto)) {
      throw new ArrayInputException();
    }
    return this.authService.login(loginUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: RequestWithUser) {
    return req.user;
  }
}
