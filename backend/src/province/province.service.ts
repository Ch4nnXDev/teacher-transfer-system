import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from '../entities/province.entity';
import { CreateProvinceDto, UpdateProvinceDto } from '../dto/province.dto';
import { ProvinceNotFoundException } from 'src/exceptions/not-found-exceptions/not-found.exceptions';

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
    return this.provinceRepository.find({ relations: ['cities'] });
  }

  async findOne(id: number): Promise<Province> {
    const province = await this.provinceRepository.findOne({
      where: { id },
      relations: ['cities'],
    });

    if (!province) {
      throw new ProvinceNotFoundException(id);
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
}
