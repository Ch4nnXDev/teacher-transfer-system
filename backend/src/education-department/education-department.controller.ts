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
  Query,
} from '@nestjs/common';
import { EducationDepartmentService } from './education-department.service';
import {
  CreateEducationDepartmentDto,
  UpdateEducationDepartmentDto,
} from '../dto/education-department.dto';
import { EducationDepartment } from '../entities/education-department.entity';
import { Roles } from '../decorator/roles/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserRole } from 'src/interfaces/entity.interface';

@Controller('education-departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EducationDepartmentController {
  constructor(private readonly departmentService: EducationDepartmentService) {}

  @Post()
  @Roles(UserRole.IT_ADMIN, UserRole.ZONAL_DIRECTOR)
  create(
    @Body() createDepartmentDto: CreateEducationDepartmentDto,
  ): Promise<EducationDepartment> {
    return this.departmentService.create(createDepartmentDto);
  }

  @Get()
  findAll(): Promise<EducationDepartment[]> {
    return this.departmentService.findAll();
  }

  @Get('search')
  findByName(@Query('name') name: string): Promise<EducationDepartment | null> {
    return this.departmentService.findByName(name);
  }

  @Get('by-type/:type')
  findByType(@Param('type') type: string): Promise<EducationDepartment[]> {
    return this.departmentService.findByType(type);
  }

  @Get('needing-teachers')
  @Roles(UserRole.IT_ADMIN, UserRole.ZONAL_DIRECTOR)
  findDepartmentsNeedingTeachers(
    @Query('ratio') ratio: string = '30',
  ): Promise<EducationDepartment[]> {
    const ratioThreshold = parseFloat(ratio);
    return this.departmentService.findDepartmentsWithSchoolsNeedingTeachers(
      ratioThreshold,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<EducationDepartment> {
    return this.departmentService.findOne(id);
  }

  @Get(':id/statistics')
  @Roles(
    UserRole.IT_ADMIN,
    UserRole.ZONAL_DIRECTOR,
    UserRole.PRINCIPAL,
    UserRole.SCHOOL_ADMIN,
  )
  getStatistics(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.departmentService.getDepartmentStatistics(id);
  }

  @Get(':id/transfer-statistics')
  @Roles(UserRole.IT_ADMIN, UserRole.ZONAL_DIRECTOR)
  getTransferStatistics(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.departmentService.getTeacherTransferStatistics(id);
  }

  @Patch(':id')
  @Roles(UserRole.IT_ADMIN, UserRole.ZONAL_DIRECTOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartmentDto: UpdateEducationDepartmentDto,
  ): Promise<EducationDepartment> {
    return this.departmentService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Roles(UserRole.IT_ADMIN)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.departmentService.remove(id);
  }
}
