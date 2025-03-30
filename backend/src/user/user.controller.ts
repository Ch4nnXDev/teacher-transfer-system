import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from '../dto/user.dto';
import { User } from '../entities/user.entity';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { Roles } from '../auth/roles.decorator';
// import { RolesGuard } from '../auth/roles.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('it_admin', 'zonal_director', 'principal')
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Post('login')
  login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<{ user: Partial<User>; token: string }> {
    return this.userService.login(loginUserDto);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('role/:role')
  // @UseGuards(JwtAuthGuard)
  findByRole(@Param('role') role: string): Promise<User[]> {
    return this.userService.findByRole(role);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('it_admin', 'zonal_director', 'principal')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('it_admin')
  remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(+id);
  }
}
