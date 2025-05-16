import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from '../entities/province.entity';
import { CreateProvinceDto, UpdateProvinceDto } from '../dto/province.dto';

@Injectable()
export class ProvinceService {
  constructor(
    @InjectRepository(Province)
    private provinceRepository: Repository<Province>,
  ) {}

  async create(createProvinceDto: CreateProvinceDto): Promise<Province> {
    const province = this.provinceRepository.create(createProvinceDto);
    return this.provinceRepository.save(province);
  }

  async findAll(): Promise<Province[]> {
    return this.provinceRepository.find({
      relations: ['cities', 'cities.schools'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Province> {
    const province = await this.provinceRepository.findOne({
      where: { id },
      relations: ['cities', 'cities.schools', 'cities.schools.department'],
    });

    if (!province) {
      throw new NotFoundException(`Province with ID ${id} not found`);
    }

    return province;
  }

  async update(
    id: number,
    updateProvinceDto: UpdateProvinceDto,
  ): Promise<Province> {
    const province = await this.findOne(id);
    Object.assign(province, updateProvinceDto);
    return this.provinceRepository.save(province);
  }

  async remove(id: number): Promise<void> {
    const province = await this.findOne(id);
    await this.provinceRepository.remove(province);
  }

  async getProvinceStatistics(id: number): Promise<any> {
    const province = await this.findOne(id);

    const totalCities = province.cities?.length || 0;
    const totalSchools =
      province.cities?.reduce(
        (sum, city) => sum + (city.schools?.length || 0),
        0,
      ) || 0;

    return {
      totalCities,
      totalSchools,
      cities:
        province.cities?.map((city) => ({
          id: city.id,
          name: city.name,
          schoolCount: city.schools?.length || 0,
        })) || [],
    };
  }

  async findByName(name: string): Promise<Province | null> {
    return this.provinceRepository.findOne({
      where: { name },
      relations: ['cities'],
    });
  }
}
