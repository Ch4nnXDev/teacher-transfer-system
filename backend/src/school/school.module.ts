import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';
import { School } from '../entities/school.entity';
import { City } from '../entities/city.entity';
import { EducationDepartment } from '../entities/education-department.entity';
import { User } from '../entities/user.entity';
import { TeacherAssignment } from '../entities/teacher-assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      School,
      City,
      EducationDepartment,
      User,
      TeacherAssignment,
    ]),
  ],
  controllers: [SchoolController],
  providers: [SchoolService],
  exports: [SchoolService, TypeOrmModule],
})
export class SchoolModule {}
