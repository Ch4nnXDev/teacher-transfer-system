import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { School } from './school.entity';
import { TransferRequest } from './transfer-request.entity';
import { TeacherAssignment } from './teacher-assignment.entity';
import { AssignableUserRole, UserRole } from '../interfaces/entity.interface';

@Entity()
@Index(['email'], { unique: true })
@Index(['nic'], { unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nic: string; // National Identity Card

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  age: number;

  @Column({ type: 'date' })
  birth: Date;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: [
      UserRole.IT_ADMIN,
      UserRole.ZONAL_DIRECTOR,
      UserRole.PRINCIPAL,
      UserRole.SCHOOL_ADMIN,
      UserRole.TEACHER,
      UserRole.STAFF,
    ],
  })
  role: AssignableUserRole;

  @Column({ nullable: true })
  employeeId: string;

  @Column({ nullable: true, type: 'text' })
  qualifications: string;

  @Column({ nullable: true, type: 'date' })
  joiningDate: Date;

  @Column({ nullable: true, type: 'text' })
  address: string; // Teacher's residence address

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  // Current school assignment (for teachers)
  @ManyToOne(() => School, (school) => school.users, { nullable: true })
  currentSchool: School | null;

  // Transfer requests made by this user
  @OneToMany(() => TransferRequest, (transfer) => transfer.teacher)
  transferRequests: TransferRequest[];

  // Teacher assignment history
  @OneToMany(() => TeacherAssignment, (assignment) => assignment.teacher)
  assignments: TeacherAssignment[];

  // Helper method to get full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
