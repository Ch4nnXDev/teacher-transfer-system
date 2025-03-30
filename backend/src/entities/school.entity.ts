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

@Entity()
export class School {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  type: string; // e.g., primary, secondary, etc.

  @ManyToOne(() => City, (city) => city.schools)
  city: City;

  @ManyToOne(() => EducationDepartment, (department) => department.schools)
  department: EducationDepartment;

  @OneToMany(() => User, (user) => user.school)
  users: User[];
}
