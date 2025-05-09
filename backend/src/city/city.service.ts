import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../entities/city.entity';
import { Province } from '../entities/province.entity';
import { CreateCityDto, UpdateCityDto } from '../dto/city.dto';
import {
  ProvinceNotFoundException,
  CityNotFoundException,
} from 'src/exceptions/not-found-exceptions/not-found.exceptions';

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
      throw new ProvinceNotFoundException(provinceId);
    }

    const city = this.cityRepository.create({
      ...cityData,
      province,
    });

    return this.cityRepository.save(city);
  }

  async findAll(): Promise<City[]> {
    return this.cityRepository.find({ relations: ['province', 'schools'] });
  }

  async findOne(id: number): Promise<City> {
    const city = await this.cityRepository.findOne({
      where: { id },
      relations: ['province', 'schools'],
    });

    if (!city) {
      throw new CityNotFoundException(id);
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
        throw new ProvinceNotFoundException(updateCityDto.provinceId);
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
}
