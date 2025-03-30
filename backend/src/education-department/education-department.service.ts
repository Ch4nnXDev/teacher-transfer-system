import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EducationDepartment } from '../entities/education-department.entity';
import {
  CreateEducationDepartmentDto,
  UpdateEducationDepartmentDto,
} from '../dto/education-department.dto';

@Injectable()
export class EducationDepartmentService {
  constructor(
    @InjectRepository(EducationDepartment)
    private departmentRepository: Repository<EducationDepartment>,
  ) {}

  async create(
    createDepartmentDto: CreateEducationDepartmentDto,
  ): Promise<EducationDepartment> {
    const department = this.departmentRepository.create(createDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async findAll(): Promise<EducationDepartment[]> {
    return this.departmentRepository.find({ relations: ['schools'] });
  }

  async findOne(id: number): Promise<EducationDepartment> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['schools'],
    });

    if (!department) {
      throw new NotFoundException(
        `Education Department with ID ${id} not found`,
      );
    }

    return department;
  }

  async update(
    id: number,
    updateDepartmentDto: UpdateEducationDepartmentDto,
  ): Promise<EducationDepartment> {
    const department = await this.findOne(id);

    Object.assign(department, updateDepartmentDto);

    return this.departmentRepository.save(department);
  }

  async remove(id: number): Promise<void> {
    const department = await this.findOne(id);
    await this.departmentRepository.remove(department);
  }
}
