import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EducationDepartment } from '../entities/education-department.entity';
import {
  CreateEducationDepartmentDto,
  UpdateEducationDepartmentDto,
} from '../dto/education-department.dto';
import { UserRole } from 'src/interfaces/entity.interface';

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
    return this.departmentRepository.find({
      relations: ['schools', 'schools.city', 'schools.users'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<EducationDepartment> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: [
        'schools',
        'schools.city',
        'schools.city.province',
        'schools.users',
      ],
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

  async getDepartmentStatistics(id: number): Promise<any> {
    const department = await this.findOne(id);

    const totalSchools = department.schools?.length || 0;
    const totalTeachers =
      department.schools?.reduce(
        (sum, school) =>
          sum +
          (school.users?.filter((user) => user.role === UserRole.TEACHER)
            .length || 0),
        0,
      ) || 0;
    const totalStudents =
      department.schools?.reduce(
        (sum, school) => sum + (school.studentCount || 0),
        0,
      ) || 0;

    // Group schools by city
    const schoolsByCity =
      department.schools?.reduce(
        (acc, school) => {
          const cityName = school.city?.name || 'Unknown';
          if (!acc[cityName]) {
            acc[cityName] = [];
          }
          acc[cityName].push(school);
          return acc;
        },
        {} as Record<string, any[]>,
      ) || {};

    return {
      totalSchools,
      totalTeachers,
      totalStudents,
      averageStudentTeacherRatio:
        totalTeachers > 0 ? totalStudents / totalTeachers : 0,
      schoolsByCity: Object.entries(schoolsByCity).map(([city, schools]) => ({
        city,
        schoolCount: schools.length,
        schools: schools.map((school) => ({
          id: school.id,
          name: school.name,
          studentCount: school.studentCount,
          teacherCount: school.teacherCount,
          studentTeacherRatio: school.studentTeacherRatio,
        })),
      })),
    };
  }

  async findByType(type: string): Promise<EducationDepartment[]> {
    return this.departmentRepository.find({
      where: { type },
      relations: ['schools', 'schools.city'],
      order: { name: 'ASC' },
    });
  }

  async findByName(name: string): Promise<EducationDepartment | null> {
    return this.departmentRepository.findOne({
      where: { name },
      relations: ['schools'],
    });
  }

  async findDepartmentsWithSchoolsNeedingTeachers(
    ratioThreshold: number = 30,
  ): Promise<EducationDepartment[]> {
    return this.departmentRepository
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.schools', 'school')
      .leftJoinAndSelect('school.city', 'city')
      .where('school.isActive = :active', { active: true })
      .andWhere('school.teacherCount > 0') // Avoid division by zero
      .andWhere('(school.studentCount / school.teacherCount) > :threshold', {
        threshold: ratioThreshold,
      })
      .orderBy('department.name', 'ASC')
      .getMany();
  }

  async getTeacherTransferStatistics(departmentId: number): Promise<any> {
    const department = await this.findOne(departmentId);

    // This would require access to transfer requests
    // For now, return basic statistics
    return {
      departmentName: department.name,
      totalSchools: department.schools?.length || 0,
      schoolsNeedingTeachers:
        department.schools?.filter((school) => school.studentTeacherRatio > 30)
          .length || 0,
      averageRatio:
        department.schools?.reduce(
          (sum, school) => sum + school.studentTeacherRatio,
          0,
        ) / (department.schools?.length || 1) || 0,
    };
  }
}
