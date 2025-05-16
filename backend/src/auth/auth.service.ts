import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from '../dto/auth.dto';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt.interface';
import { AuthResponse, RegularUser } from '../interfaces/auth.interface';

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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...result } = user;
        return result;
      }
      return null;
    } catch {
      return null;
    }
  }

  // Updated to accept RegularUser (what LocalStrategy returns)
  async login(user: RegularUser): Promise<AuthResponse> {
    // User object comes from LocalStrategy which calls validateUser
    // It contains the validated user data (without password)

    // RegularUser always has userId, email, role, so we can access them directly
    // Generate JWT payload
    const payload: JwtPayload = {
      email: user.email,
      sub: user.userId,
      role: user.role,
    };

    // For the response, we need to get full user details from database
    const fullUser = await this.userService.findOne(user.userId);

    // Return user data and token
    return {
      user: {
        id: fullUser.id,
        firstName: fullUser.firstName,
        lastName: fullUser.lastName,
        email: fullUser.email,
        role: fullUser.role,
      },
      token: this.jwtService.sign(payload),
    };
  }

  // Keep the old login method for backward compatibility if needed
  async loginWithDto(loginUserDto: LoginUserDto): Promise<AuthResponse | null> {
    // First validate the user
    const user = await this.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );

    if (!user) {
      return null;
    }

    // Convert Partial<User> to RegularUser format
    const regularUser: RegularUser = {
      userId: user.id!,
      email: user.email!,
      role: user.role!,
    };

    return this.login(regularUser);
  }

  verifyToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      return null;
    }
  }
}
