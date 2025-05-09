import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from '../entities/school.entity';
import { City } from '../entities/city.entity';
import { EducationDepartment } from '../entities/education-department.entity';
import { CreateSchoolDto, UpdateSchoolDto } from '../dto/school.dto';
import {
  CityNotFoundException,
  DepartmentNotFoundException,
  SchoolNotFoundException,
} from 'src/exceptions/not-found-exceptions/not-found.exceptions';

@Injectable()
export class SchoolService {
  constructor(
    @InjectRepository(School)
    private schoolRepository: Repository<School>,
    @InjectRepository(City)
    private cityRepository: Repository<City>,
    @InjectRepository(EducationDepartment)
    private departmentRepository: Repository<EducationDepartment>,
  ) {}

  async create(createSchoolDto: CreateSchoolDto): Promise<School> {
    const { cityId, departmentId, ...schoolData } = createSchoolDto;

    const city = await this.cityRepository.findOne({ where: { id: cityId } });
    if (!city) {
      throw new CityNotFoundException(cityId);
    }

    const department = await this.departmentRepository.findOne({
      where: { id: departmentId },
    });
    if (!department) {
      throw new DepartmentNotFoundException(departmentId);
    }

    const school = this.schoolRepository.create({
      ...schoolData,
      city,
      department,
    });

    return this.schoolRepository.save(school);
  }

  async findAll(): Promise<School[]> {
    return this.schoolRepository.find({
      relations: ['city', 'department', 'users'],
    });
  }

  async findOne(id: number): Promise<School> {
    const school = await this.schoolRepository.findOne({
      where: { id },
      relations: ['city', 'department', 'users'],
    });

    if (!school) {
      throw new SchoolNotFoundException(id);
    }

    return school;
  }

  async update(id: number, updateSchoolDto: UpdateSchoolDto): Promise<School> {
    const school = await this.findOne(id);

    if (updateSchoolDto.cityId) {
      const city = await this.cityRepository.findOne({
        where: { id: updateSchoolDto.cityId },
      });
      if (!city) {
        throw new CityNotFoundException(updateSchoolDto.cityId);
      }
      school.city = city;
    }

    if (updateSchoolDto.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: { id: updateSchoolDto.departmentId },
      });
      if (!department) {
        throw new DepartmentNotFoundException(updateSchoolDto.departmentId);
      }
      school.department = department;
    }

    Object.assign(school, updateSchoolDto);

    return this.schoolRepository.save(school);
  }

  async remove(id: number): Promise<void> {
    const school = await this.findOne(id);
    await this.schoolRepository.remove(school);
  }
}
