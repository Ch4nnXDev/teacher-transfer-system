import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { CityModule } from './city/city.module';
import { ProvinceModule } from './province/province.module';
import { UserModule } from './user/user.module';
import { SchoolModule } from './school/school.module';
import { EducationDepartmentModule } from './education-department/education-department.module';
import { DatabaseModule } from 'src/database/database.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    DatabaseModule,
    CityModule,
    ProvinceModule,
    UserModule,
    SchoolModule,
    EducationDepartmentModule,
    AuthModule,
  ],
  providers: [AppService, AuthService],
})
export class AppModule {}
