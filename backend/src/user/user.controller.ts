import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { User } from '../entities/user.entity';
import { Roles } from '../decorator/roles.decorator';
import { FlexibleAuthGuard } from 'src/guards/flexible-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { AuthenticatedRequest } from 'src/interfaces/auth.interface';
import { UserRole } from 'src/interfaces/entity.interface';
import { Public } from 'src/decorator/public.decorator';

@Controller('users')
@UseGuards(FlexibleAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.IT_ADMIN, UserRole.ZONAL_DIRECTOR, UserRole.PRINCIPAL)
  create(
    @Body() createUserDto: CreateUserDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<User> {
    return this.userService.create(createUserDto, req.user);
  }

  @Get()
  @Roles(
    UserRole.IT_ADMIN,
    UserRole.ZONAL_DIRECTOR,
    UserRole.PRINCIPAL,
    UserRole.SCHOOL_ADMIN,
  )
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('role/:role')
  @Roles(
    UserRole.IT_ADMIN,
    UserRole.ZONAL_DIRECTOR,
    UserRole.PRINCIPAL,
    UserRole.SCHOOL_ADMIN,
  )
  findByRole(@Param('role') role: UserRole): Promise<User[]> {
    return this.userService.findByRole(role);
  }

  @Get('eligible-for-transfer')
  @Roles(UserRole.IT_ADMIN, UserRole.ZONAL_DIRECTOR)
  findTeachersEligibleForTransfer(): Promise<User[]> {
    return this.userService.findTeachersEligibleForTransfer();
  }

  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest): Promise<User> {
    return this.userService.findOne(req.user.userId);
  }

  @Get(':id')
  @Roles(
    UserRole.IT_ADMIN,
    UserRole.ZONAL_DIRECTOR,
    UserRole.PRINCIPAL,
    UserRole.SCHOOL_ADMIN,
    UserRole.TEACHER,
    UserRole.STAFF,
  )
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.IT_ADMIN, UserRole.ZONAL_DIRECTOR, UserRole.PRINCIPAL)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<User> {
    return this.userService.update(id, updateUserDto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.IT_ADMIN)
  remove(@Param('id', ParseIntPipe) id: string): Promise<void> {
    return this.userService.remove(+id);
  }

  // Example of a public route
  @Get('public/health')
  @Public()
  healthCheck(): string {
    return 'User service is healthy';
  }
}
