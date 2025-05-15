import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { School } from '../entities/school.entity';
import { TeacherAssignment } from '../entities/teacher-assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, School, TeacherAssignment])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
