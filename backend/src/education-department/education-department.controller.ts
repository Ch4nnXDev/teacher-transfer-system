import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EducationDepartmentService } from './education-department.service';
import {
  CreateEducationDepartmentDto,
  UpdateEducationDepartmentDto,
} from '../dto/education-department.dto';
import { EducationDepartment } from '../entities/education-department.entity';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../decorator/roles/roles.decorator';
import { RolesGuard } from '../guards/roles/roles.guard';
import { ArrayInputException } from 'src/exceptions/validation-exceptions/validation.exceptions';

@Controller('education-departments')
export class EducationDepartmentController {
  constructor(private readonly departmentService: EducationDepartmentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('it_admin', 'zonal_director')
  create(
    @Body() createDepartmentDto: CreateEducationDepartmentDto,
  ): Promise<EducationDepartment> {
    if (Array.isArray(createDepartmentDto)) {
      throw new ArrayInputException();
    }
    return this.departmentService.create(createDepartmentDto);
  }

  @Get()
  findAll(): Promise<EducationDepartment[]> {
    return this.departmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<EducationDepartment> {
    return this.departmentService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('it_admin', 'zonal_director')
  update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateEducationDepartmentDto,
  ): Promise<EducationDepartment> {
    if (Array.isArray(updateDepartmentDto)) {
      throw new ArrayInputException();
    }
    return this.departmentService.update(+id, updateDepartmentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('it_admin')
  remove(@Param('id') id: string): Promise<void> {
    return this.departmentService.remove(+id);
  }
}
