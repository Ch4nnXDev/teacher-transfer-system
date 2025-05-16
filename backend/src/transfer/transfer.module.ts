import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferController } from './transfer.controller';
import { TransferService } from './transfer.service';
import { TransferRequest } from '../entities/transfer-request.entity';
import { User } from '../entities/user.entity';
import { School } from '../entities/school.entity';
import { TeacherAssignment } from '../entities/teacher-assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransferRequest,
      User,
      School,
      TeacherAssignment,
    ]),
  ],
  controllers: [TransferController],
  providers: [TransferService],
  exports: [TransferService, TypeOrmModule],
})
export class TransferModule {}
