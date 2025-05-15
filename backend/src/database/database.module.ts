import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Import all entities
import { User } from '../entities/user.entity';
import { Province } from '../entities/province.entity';
import { City } from '../entities/city.entity';
import { School } from '../entities/school.entity';
import { EducationDepartment } from '../entities/education-department.entity';
import { TransferRequest } from '../entities/transfer-request.entity';
import { TeacherAssignment } from '../entities/teacher-assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'school_management'),
        entities: [
          User,
          Province,
          City,
          School,
          EducationDepartment,
          TransferRequest,
          TeacherAssignment,
        ],
        synchronize: configService.get<boolean>('DB_SYNC', true),
        autoLoadEntities: true,
        logging: configService.get('NODE_ENV') === 'development',
        timezone: '+00:00', // UTC timezone
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
