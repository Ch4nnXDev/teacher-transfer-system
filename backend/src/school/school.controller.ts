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
import { Roles } from '../decorator/roles.decorator';
import { CreateSchoolDto, UpdateSchoolDto } from 'src/dto/school.dto';
import { FlexibleAuthGuard } from 'src/guards/flexible-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserRole } from 'src/interfaces/entity.interface';
import { Public } from 'src/decorator/public.decorator';

@Controller('schools')
@UseGuards(FlexibleAuthGuard, RolesGuard)
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

  @Get('high-ratio')
  @Roles(UserRole.IT_ADMIN, UserRole.ZONAL_DIRECTOR)
  findSchoolsWithHighRatio(): Promise<School[]> {
    return this.schoolService.findSchoolsWithHighRatio(30);
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

  @Patch(':id/student-count')
  @Roles(UserRole.IT_ADMIN, UserRole.ZONAL_DIRECTOR, UserRole.PRINCIPAL)
  updateStudentCount(
    @Param('id', ParseIntPipe) id: number,
    @Body('studentCount') studentCount: number,
  ): Promise<School> {
    return this.schoolService.updateStudentCount(id, studentCount);
  }

  @Delete(':id')
  @Roles(UserRole.IT_ADMIN)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.schoolService.remove(id);
  }

  // Public route example
  @Get('public/list')
  @Public()
  getPublicSchoolList(): Promise<School[]> {
    return this.schoolService.findAll();
  }
}
