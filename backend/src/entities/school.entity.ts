import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { City } from './city.entity';
import { EducationDepartment } from './education-department.entity';
import { User } from './user.entity';
import { TransferRequest } from './transfer-request.entity';
import { TeacherAssignment } from './teacher-assignment.entity';

@Entity()
export class School {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text' })
  address: string;

  @Column()
  type: string; // e.g., public, private, charter

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ default: 0 })
  studentCount: number; // Track total number of students

  @Column({ default: 0 })
  teacherCount: number; // Track total number of teachers

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

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

  @ManyToOne(() => City, (city) => city.schools)
  city: City;

  @ManyToOne(() => EducationDepartment, (department) => department.schools)
  department: EducationDepartment;

  @OneToMany(() => User, (user) => user.currentSchool)
  users: User[];

  @OneToMany(() => TransferRequest, (transfer) => transfer.targetSchool)
  incomingTransferRequests: TransferRequest[];

  @OneToMany(() => TeacherAssignment, (assignment) => assignment.school)
  teacherAssignments: TeacherAssignment[];

  // Calculate student-teacher ratio
  get studentTeacherRatio(): number {
    return this.teacherCount > 0
      ? this.studentCount / this.teacherCount
      : this.studentCount;
  }
}
