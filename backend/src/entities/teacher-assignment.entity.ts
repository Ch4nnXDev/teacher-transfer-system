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
import {
  TeacherAssignmentStatus,
  TeacherLeavingReason,
} from '../interfaces/entity.interface';

@Entity()
@Index(['teacher', 'school'])
@Index(['startDate', 'endDate'])
export class TeacherAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  startDate: Date; // When teacher joined this school

  @Column({ type: 'date', nullable: true })
  endDate: Date; // When teacher left this school (null if still active)

  @Column({
    type: 'enum',
    enum: TeacherAssignmentStatus,
    default: TeacherAssignmentStatus.ACTIVE,
  })
  status: TeacherAssignmentStatus;

  @Column({
    type: 'enum',
    enum: TeacherLeavingReason,
    nullable: true,
  })
  leavingReason: TeacherLeavingReason;

  @Column({ type: 'text', nullable: true })
  remarks: string; // Additional notes about the assignment

  @Column({ nullable: true })
  transferRequestId: number; // Reference to transfer request that caused this assignment

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.assignments)
  teacher: User;

  @ManyToOne(() => School, (school) => school.teacherAssignments)
  school: School;

  // Calculate years of service at this school
  get yearsOfService(): number {
    const endDateToUse = this.endDate || new Date();
    const diffInTime = endDateToUse.getTime() - this.startDate.getTime();
    const diffInYears = diffInTime / (1000 * 3600 * 24 * 365.25);
    return Math.floor(diffInYears * 100) / 100; // Round to 2 decimal places
  }

  // Check if teacher is eligible for transfer (5+ years)
  get isEligibleForTransfer(): boolean {
    return (
      this.yearsOfService >= 5 && this.status === TeacherAssignmentStatus.ACTIVE
    );
  }

  // Calculate duration in a readable format
  get durationDescription(): string {
    const years = Math.floor(this.yearsOfService);
    const months = Math.floor((this.yearsOfService - years) * 12);

    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else if (months === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
    }
  }
}
