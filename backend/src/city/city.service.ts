import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../entities/city.entity';
import { Province } from '../entities/province.entity';
import { CreateCityDto, UpdateCityDto } from '../dto/city.dto';
import { UserRole } from 'src/interfaces/entity.interface';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private cityRepository: Repository<City>,
    @InjectRepository(Province)
    private provinceRepository: Repository<Province>,
  ) {}

  async create(createCityDto: CreateCityDto): Promise<City> {
    const { provinceId, ...cityData } = createCityDto;

    const province = await this.provinceRepository.findOne({
      where: { id: provinceId },
    });
    if (!province) {
      throw new NotFoundException(`Province with ID ${provinceId} not found`);
    }

    const city = this.cityRepository.create({
      ...cityData,
      province,
    });

    return this.cityRepository.save(city);
  }

  async findAll(): Promise<City[]> {
    return this.cityRepository.find({
      relations: ['province', 'schools', 'schools.department'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<City> {
    const city = await this.cityRepository.findOne({
      where: { id },
      relations: ['province', 'schools', 'schools.department', 'schools.users'],
    });

    if (!city) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }

    return city;
  }

  async update(id: number, updateCityDto: UpdateCityDto): Promise<City> {
    const city = await this.findOne(id);

    if (updateCityDto.provinceId) {
      const province = await this.provinceRepository.findOne({
        where: { id: updateCityDto.provinceId },
      });
      if (!province) {
        throw new NotFoundException(
          `Province with ID ${updateCityDto.provinceId} not found`,
        );
      }
      city.province = province;
    }

    Object.assign(city, updateCityDto);

    return this.cityRepository.save(city);
  }

  async remove(id: number): Promise<void> {
    const city = await this.findOne(id);
    await this.cityRepository.remove(city);
  }

  async findByProvince(provinceId: number): Promise<City[]> {
    return this.cityRepository.find({
      where: { province: { id: provinceId } },
      relations: ['province', 'schools'],
      order: { name: 'ASC' },
    });
  }

  async getCityStatistics(id: number): Promise<any> {
    const city = await this.findOne(id);

    const totalSchools = city.schools?.length || 0;
    const totalTeachers =
      city.schools?.reduce(
        (sum, school) =>
          sum +
          (school.users?.filter((user) => user.role === UserRole.TEACHER)
            .length || 0),
        0,
      ) || 0;
    const totalStudents =
      city.schools?.reduce(
        (sum, school) => sum + (school.studentCount || 0),
        0,
      ) || 0;

    return {
      totalSchools,
      totalTeachers,
      totalStudents,
      averageStudentTeacherRatio:
        totalTeachers > 0 ? totalStudents / totalTeachers : 0,
      schools:
        city.schools?.map((school) => ({
          id: school.id,
          name: school.name,
          studentCount: school.studentCount,
          teacherCount: school.teacherCount,
          studentTeacherRatio: school.studentTeacherRatio,
        })) || [],
    };
  }

  async findByName(name: string): Promise<City | null> {
    return this.cityRepository.findOne({
      where: { name },
      relations: ['province', 'schools'],
    });
  }

  async findCitiesWithSchoolsNeedingTeachers(
    ratioThreshold: number = 30,
  ): Promise<City[]> {
    return this.cityRepository
      .createQueryBuilder('city')
      .leftJoinAndSelect('city.schools', 'school')
      .leftJoinAndSelect('city.province', 'province')
      .where('school.isActive = :active', { active: true })
      .andWhere('school.teacherCount > 0') // Avoid division by zero
      .andWhere('(school.studentCount / school.teacherCount) > :threshold', {
        threshold: ratioThreshold,
      })
      .orderBy('city.name', 'ASC')
      .getMany();
  }
}
