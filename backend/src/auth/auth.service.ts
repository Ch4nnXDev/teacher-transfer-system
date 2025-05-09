import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from 'src/dto/user.dto';
import { User } from 'src/entities/user.entity';

// Define interfaces for improved type safety
interface JwtPayload {
  email: string;
  sub: number;
  role: string;
}

interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

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
        const { password, ...result } = user;
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

  verifyToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      return null;
    }
  }
}
