import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Province } from './province.entity';
import { School } from './school.entity';

@Entity()
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Province, (province) => province.cities)
  province: Province;

  @OneToMany(() => School, (school) => school.city)
  schools: School[];
}
