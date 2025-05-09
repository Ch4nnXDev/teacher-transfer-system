import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducationDepartmentController } from './education-department.controller';
import { EducationDepartmentService } from './education-department.service';
import { EducationDepartment } from '../entities/education-department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EducationDepartment])],
  controllers: [EducationDepartmentController],
  providers: [EducationDepartmentService],
  exports: [EducationDepartmentService],
})
export class EducationDepartmentModule {}
