import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { User } from '../entities/user.entity';
import { Roles } from '../decorator/roles/roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../guards/roles/roles.guard';
import { InvalidDataException } from 'src/exceptions/validation-exceptions/validation.exceptions';
import { RequestWithUser } from 'src/interfaces/request/request.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('it_admin', 'zonal_director', 'principal')
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    if (Array.isArray(createUserDto)) {
      throw new InvalidDataException('Array input is not allowed');
    }
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('role/:role')
  @UseGuards(JwtAuthGuard)
  findByRole(@Param('role') role: string): Promise<User[]> {
    return this.userService.findByRole(role);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('it_admin', 'zonal_director', 'principal')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestWithUser,
  ): Promise<User> {
    if (Array.isArray(updateUserDto)) {
      throw new InvalidDataException('Array input is not allowed');
    }
    return this.userService.update(+id, updateUserDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('it_admin')
  remove(@Param('id') id: string, @Req() req: RequestWithUser): Promise<void> {
    return this.userService.remove(+id, req.user);
  }
}
