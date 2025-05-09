import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { School } from './school.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  role: string; // 'teacher', 'principal', 'zonal_director', 'it_admin'

  @Column({ nullable: true })
  employeeId: string;

  @Column({ nullable: true })
  qualifications: string;

  @Column({ nullable: true })
  joiningDate: Date;

  @ManyToOne(() => School, (school) => school.users, { nullable: true })
  school: School;
}
