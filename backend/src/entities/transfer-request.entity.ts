import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { School } from './school.entity';
import { TransferRequestStatus } from 'src/interfaces/entity.interface';

@Entity()
@Index(['teacher', 'targetSchool'])
export class TransferRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: TransferRequestStatus,
    default: TransferRequestStatus.DRAFT,
  })
  status: TransferRequestStatus;

  @Column({ type: 'text', nullable: true })
  reason: string | null; // Reason for transfer request

  @Column({ type: 'text', nullable: true })
  remarks: string | null; // Additional remarks

  @Column({ type: 'text', nullable: true })
  schoolRemarks: string | null; // Remarks from school administration

  @Column({ type: 'text', nullable: true })
  zonalDirectorRemarks: string | null; // Remarks from zonal director

  @Column({ type: 'date', nullable: true })
  requestedTransferDate: Date | null; // When teacher wants to transfer

  @Column({ type: 'date', nullable: true })
  approvedTransferDate: Date | null; // Actual approved transfer date

  @Column({ default: 0, type: 'decimal', precision: 10, scale: 2 })
  distanceFromResidence: number; // Distance from teacher's residence to target school

  @Column({ default: 0, type: 'decimal', precision: 5, scale: 2 })
  targetSchoolRatio: number; // Student-teacher ratio at target school when request was made

  @Column({ type: 'int', default: 0 })
  yearsAtCurrentSchool: number; // Years of service at current school

  @Column({ default: false })
  isEligible: boolean; // Whether teacher is eligible for transfer (5+ years)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  reviewedBySchoolAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  forwardedToZonalAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  finalizedAt: Date | null;

  @ManyToOne(() => User, (user) => user.transferRequests)
  teacher: User;

  @ManyToOne(() => School, (school) => school.incomingTransferRequests)
  targetSchool: School;

  @ManyToOne(() => User, { nullable: true })
  reviewedBySchool: User; // Principal or school admin who reviewed

  @ManyToOne(() => User, { nullable: true })
  reviewedByZonal: User; // Zonal director who approved/rejected

  // Helper method to check if request can be updated
  canBeUpdated(): boolean {
    return this.status === TransferRequestStatus.DRAFT;
  }

  // Helper method to check if request can be submitted
  canBeSubmitted(): boolean {
    return this.status === TransferRequestStatus.DRAFT && this.isEligible;
  }

  // Helper method to get status description
  getStatusDescription(): string {
    switch (this.status) {
      case TransferRequestStatus.DRAFT:
        return 'Draft - Not yet submitted';
      case TransferRequestStatus.SUBMITTED:
        return 'Submitted - Awaiting school review';
      case TransferRequestStatus.SCHOOL_REVIEWED:
        return 'School reviewed - Awaiting forwarding to zonal director';
      case TransferRequestStatus.FORWARDED_TO_ZONAL:
        return 'Forwarded to zonal director - Awaiting final decision';
      case TransferRequestStatus.APPROVED:
        return 'Approved by zonal director';
      case TransferRequestStatus.REJECTED:
        return 'Rejected';
      default:
        return 'Unknown status';
    }
  }
}
