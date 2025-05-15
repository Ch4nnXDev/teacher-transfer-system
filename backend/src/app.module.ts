import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProvinceModule } from './province/province.module';
import { CityModule } from './city/city.module';
import { SchoolModule } from './school/school.module';
import { EducationDepartmentModule } from './education-department/education-department.module';
import { TransferModule } from './transfer/transfer.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database configuration
    DatabaseModule,

    // Feature modules
    AuthModule,
    UserModule,
    ProvinceModule,
    CityModule,
    SchoolModule,
    EducationDepartmentModule,
    TransferModule,
  ],
})
export class AppModule {}
