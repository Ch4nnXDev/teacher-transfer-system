import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from '../entities/school.entity';
import { City } from '../entities/city.entity';
import { EducationDepartment } from '../entities/education-department.entity';
import { CreateSchoolDto, UpdateSchoolDto } from 'src/dto/school.dto';
import { UserRole } from 'src/interfaces/entity.interface';

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
      throw new NotFoundException(`City with ID ${cityId} not found`);
    }

    const department = await this.departmentRepository.findOne({
      where: { id: departmentId },
    });
    if (!department) {
      throw new NotFoundException(
        `Education Department with ID ${departmentId} not found`,
      );
    }

    const school = this.schoolRepository.create({
      ...schoolData,
      city,
      department,
      studentCount: schoolData.studentCount || 0,
      teacherCount: 0, // Will be updated when teachers are assigned
    });

    return this.schoolRepository.save(school);
  }

  async findAll(): Promise<School[]> {
    return this.schoolRepository.find({
      relations: ['city', 'city.province', 'department', 'users'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<School> {
    const school = await this.schoolRepository.findOne({
      where: { id },
      relations: [
        'city',
        'city.province',
        'department',
        'users',
        'teacherAssignments',
        'teacherAssignments.teacher',
        'incomingTransferRequests',
        'incomingTransferRequests.teacher',
      ],
    });

    if (!school) {
      throw new NotFoundException(`School with ID ${id} not found`);
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
        throw new NotFoundException(
          `City with ID ${updateSchoolDto.cityId} not found`,
        );
      }
      school.city = city;
    }

    if (updateSchoolDto.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: { id: updateSchoolDto.departmentId },
      });
      if (!department) {
        throw new NotFoundException(
          `Education Department with ID ${updateSchoolDto.departmentId} not found`,
        );
      }
      school.department = department;
    }

    Object.assign(school, updateSchoolDto);

    return this.schoolRepository.save(school);
  }

  async remove(id: number): Promise<void> {
    const school = await this.findOne(id);

    // Soft delete by setting isActive to false
    school.isActive = false;
    await this.schoolRepository.save(school);
  }

  async updateTeacherCount(schoolId: number): Promise<void> {
    const school = await this.schoolRepository.findOne({
      where: { id: schoolId },
      relations: ['users'],
    });

    if (school) {
      // Count active teachers at this school
      const teacherCount = school.users.filter(
        (user) => user.role === UserRole.TEACHER && user.isActive,
      ).length;

      school.teacherCount = teacherCount;
      await this.schoolRepository.save(school);
    }
  }

  async findByCity(cityId: number): Promise<School[]> {
    return this.schoolRepository.find({
      where: { city: { id: cityId }, isActive: true },
      relations: ['city', 'department'],
      order: { name: 'ASC' },
    });
  }

  async findByDepartment(departmentId: number): Promise<School[]> {
    return this.schoolRepository.find({
      where: { department: { id: departmentId }, isActive: true },
      relations: ['city', 'department'],
      order: { name: 'ASC' },
    });
  }

  async getSchoolStatistics(id: number): Promise<any> {
    const school = await this.findOne(id);

    return {
      totalStudents: school.studentCount,
      totalTeachers: school.teacherCount,
      studentTeacherRatio: school.studentTeacherRatio,
      activeTransferRequests: school.incomingTransferRequests?.length || 0,
      teacherAssignments: school.teacherAssignments?.length || 0,
    };
  }

  async updateStudentCount(
    schoolId: number,
    studentCount: number,
  ): Promise<School> {
    const school = await this.schoolRepository.findOne({
      where: { id: schoolId },
    });

    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }

    school.studentCount = studentCount;
    return this.schoolRepository.save(school);
  }

  async findSchoolsWithHighRatio(threshold: number = 30): Promise<School[]> {
    // Find schools with student-teacher ratio above threshold
    return this.schoolRepository
      .createQueryBuilder('school')
      .leftJoinAndSelect('school.city', 'city')
      .leftJoinAndSelect('school.department', 'department')
      .where('school.isActive = :active', { active: true })
      .andWhere('school.teacherCount > 0') // Avoid division by zero
      .andWhere('(school.studentCount / school.teacherCount) > :threshold', {
        threshold,
      })
      .orderBy('(school.studentCount / school.teacherCount)', 'DESC')
      .getMany();
  }

  async findSchoolsByProximity(
    latitude: number,
    longitude: number,
    radiusKm: number = 50,
  ): Promise<School[]> {
    // Simple radius search - for production, consider using PostGIS
    return this.schoolRepository
      .createQueryBuilder('school')
      .leftJoinAndSelect('school.city', 'city')
      .leftJoinAndSelect('school.department', 'department')
      .where('school.isActive = :active', { active: true })
      .andWhere('school.latitude IS NOT NULL')
      .andWhere('school.longitude IS NOT NULL')
      .getMany()
      .then((schools) => {
        // Filter by distance calculation
        return schools
          .filter((school) => {
            const distance = this.calculateDistance(
              latitude,
              longitude,
              school.latitude,
              school.longitude,
            );
            return distance <= radiusKm;
          })
          .sort((a, b) => {
            const distanceA = this.calculateDistance(
              latitude,
              longitude,
              a.latitude,
              a.longitude,
            );
            const distanceB = this.calculateDistance(
              latitude,
              longitude,
              b.latitude,
              b.longitude,
            );
            return distanceA - distanceB;
          });
      });
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
