import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { School } from '../entities/school.entity';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from '../dto/user.dto';

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
      throw new ConflictException(
        `User with email ${userData.email} already exists`,
      );
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
        throw new NotFoundException(`School with ID ${schoolId} not found`);
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
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ user: Partial<User>; token: string }> {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password', 'role'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // In a real application, you would generate a JWT token here
    const token = 'dummy-token';

    const { password: _, ...result } = user;

    return { user: result, token };
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
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
        throw new NotFoundException(`School with ID ${schoolId} not found`);
      }
      user.school = school;
    }

    Object.assign(user, userData);

    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
