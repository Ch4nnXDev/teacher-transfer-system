import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { School } from './school.entity';

@Entity()
export class EducationDepartment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string; // e.g., government, semi-government

  @OneToMany(() => School, (school) => school.department)
  schools: School[];
}
