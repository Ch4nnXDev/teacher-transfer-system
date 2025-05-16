import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducationDepartmentController } from './education-department.controller';
import { EducationDepartmentService } from './education-department.service';
import { EducationDepartment } from '../entities/education-department.entity';
import { School } from '../entities/school.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EducationDepartment, School])],
  controllers: [EducationDepartmentController],
  providers: [EducationDepartmentService],
  exports: [EducationDepartmentService, TypeOrmModule],
})
export class EducationDepartmentModule {}
