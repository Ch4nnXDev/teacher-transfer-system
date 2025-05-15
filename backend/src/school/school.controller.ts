import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { SchoolService } from './school.service';
import { School } from '../entities/school.entity';
import { Roles } from '../decorator/roles/roles.decorator';
import { CreateSchoolDto, UpdateSchoolDto } from 'src/dto/school.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserRole } from 'src/interfaces/entity.interface';

@Controller('schools')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Post()
  @Roles(UserRole.IT_ADMIN, UserRole.ZONAL_DIRECTOR)
  create(@Body() createSchoolDto: CreateSchoolDto): Promise<School> {
    return this.schoolService.create(createSchoolDto);
  }

  @Get()
  findAll(): Promise<School[]> {
    return this.schoolService.findAll();
  }

  @Get('by-city/:cityId')
  findByCity(@Param('cityId', ParseIntPipe) cityId: number): Promise<School[]> {
    return this.schoolService.findByCity(cityId);
  }

  @Get('by-department/:departmentId')
  findByDepartment(
    @Param('departmentId', ParseIntPipe) departmentId: number,
  ): Promise<School[]> {
    return this.schoolService.findByDepartment(departmentId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<School> {
    return this.schoolService.findOne(id);
  }

  @Get(':id/statistics')
  @Roles(
    UserRole.IT_ADMIN,
    UserRole.ZONAL_DIRECTOR,
    UserRole.PRINCIPAL,
    UserRole.SCHOOL_ADMIN,
  )
  getStatistics(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.schoolService.getSchoolStatistics(id);
  }

  @Patch(':id')
  @Roles(UserRole.IT_ADMIN, UserRole.ZONAL_DIRECTOR, UserRole.PRINCIPAL)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSchoolDto: UpdateSchoolDto,
  ): Promise<School> {
    return this.schoolService.update(id, updateSchoolDto);
  }

  @Delete(':id')
  @Roles(UserRole.IT_ADMIN)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.schoolService.remove(id);
  }
}
