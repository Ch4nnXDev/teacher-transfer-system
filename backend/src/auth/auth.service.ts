import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from 'src/dto/user.dto';
import { User } from 'src/entities/user.entity';
import { AuthResponse } from 'src/interfaces/auth/auth.interface';
import { JwtPayload } from 'src/interfaces/jwt/jwt.interface';
import {
  InvalidCredentialsException,
  InvalidTokenException,
} from 'src/exceptions/auth-exceptions/auth.exceptions';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Partial<User> | null> {
    try {
      const user = await this.userService.findByEmail(email);
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (user && isPasswordValid) {
        // Don't return the password in the user object
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...result } = user;
        return result;
      }
      return null;
    } catch {
      return null;
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<AuthResponse> {
    // First validate the user
    const user = await this.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );

    if (!user) {
      throw new InvalidCredentialsException();
    }

    // Ensure all required properties exist
    if (!user.email || !user.id || !user.role || !user.name) {
      throw new InvalidCredentialsException();
    }

    // Generate JWT payload
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    // Return user data and token
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: this.jwtService.sign(payload),
    };
  }

  verifyToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new InvalidTokenException();
    }
  }
}
