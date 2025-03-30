import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { CityModule } from './city/city.module';
import { ProvinceModule } from './province/province.module';
import { UserModule } from './user/user.module';
import { SchoolModule } from './school/school.module';
import { EducationDepartmentModule } from './education-department/education-department.module';
import { DatabaseModule } from 'database/database.module';

@Module({
  imports: [
    DatabaseModule,
    CityModule,
    ProvinceModule,
    UserModule,
    SchoolModule,
    EducationDepartmentModule,
  ],
  providers: [AppService],
})
export class AppModule {}
