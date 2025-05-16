import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from '../dto/auth.dto';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt.interface';
import { AuthResponse } from '../interfaces/auth.interface';

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

      if (!user.isActive) {
        return null; // User is inactive
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (user && isPasswordValid) {
        // Don't return the password in the user object
        const { password: _, ...result } = user;
        return result;
      }
      return null;
    } catch {
      return null;
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<AuthResponse | null> {
    // First validate the user
    const user = await this.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );

    if (!user) {
      return null; // This will trigger UnauthorizedException in the Guard
    }

    // Ensure all required properties exist
    if (
      !user.email ||
      !user.id ||
      !user.role ||
      !user.firstName ||
      !user.lastName
    ) {
      return null;
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
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      token: this.jwtService.sign(payload),
    };
  }

  verifyToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      return null;
    }
  }
}
