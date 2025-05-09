import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';
import { School } from '../entities/school.entity';
import { City } from '../entities/city.entity';
import { EducationDepartment } from '../entities/education-department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([School, City, EducationDepartment])],
  controllers: [SchoolController],
  providers: [SchoolService],
  exports: [SchoolService],
})
export class SchoolModule {}
