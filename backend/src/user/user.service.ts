import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { School } from '../entities/school.entity';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { UnauthorizedAccessException } from 'src/exceptions/auth-exceptions/auth.exceptions';
import { UserEmailExistsException } from 'src/exceptions/database-exceptions/database.exceptions';
import {
  SchoolNotFoundException,
  UserNotFoundException,
  UserEmailNotFoundException,
} from 'src/exceptions/not-found-exceptions/not-found.exceptions';
import { JwtUser } from 'src/interfaces/jwt/jwt.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(School)
    private schoolRepository: Repository<School>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { schoolId, password, ...userData } = createUserDto;

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new UserEmailExistsException(userData.email);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    if (schoolId) {
      const school = await this.schoolRepository.findOne({
        where: { id: schoolId },
      });

      if (!school) {
        throw new SchoolNotFoundException(schoolId);
      }

      user.school = school;
    }

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['school'],
      select: [
        'id',
        'name',
        'email',
        'role',
        'employeeId',
        'qualifications',
        'joiningDate',
      ],
    });
  }

  async findByRole(role: string): Promise<User[]> {
    return this.userRepository.find({
      where: { role },
      relations: ['school'],
      select: [
        'id',
        'name',
        'email',
        'role',
        'employeeId',
        'qualifications',
        'joiningDate',
      ],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['school'],
      select: [
        'id',
        'name',
        'email',
        'role',
        'employeeId',
        'qualifications',
        'joiningDate',
      ],
    });

    if (!user) {
      throw new UserNotFoundException(id);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password', 'role'],
    });

    if (!user) {
      throw new UserEmailNotFoundException(email);
    }

    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    jwtUser?: JwtUser,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new UserNotFoundException(id);
    }

    // Add authorization check - ensure users can only update themselves unless they are admins
    if (jwtUser && jwtUser.userId !== id && jwtUser.role !== 'it_admin') {
      throw new UnauthorizedAccessException(
        'You can only update your own profile',
      );
    }

    const { schoolId, password, ...userData } = updateUserDto;

    if (password) {
      userData['password'] = await bcrypt.hash(password, 10);
    }

    if (schoolId) {
      const school = await this.schoolRepository.findOne({
        where: { id: schoolId },
      });

      if (!school) {
        throw new SchoolNotFoundException(schoolId);
      }

      user.school = school;
    }

    Object.assign(user, userData);

    return this.userRepository.save(user);
  }

  async remove(id: number, jwtUser?: JwtUser): Promise<void> {
    // Ensure only admins can delete users
    if (jwtUser && jwtUser.role !== 'it_admin') {
      throw new UnauthorizedAccessException(
        'Only administrators can delete users',
      );
    }

    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
