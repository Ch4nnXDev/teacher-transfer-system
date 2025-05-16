import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityController } from './city.controller';
import { CityService } from './city.service';
import { City } from '../entities/city.entity';
import { Province } from '../entities/province.entity';
import { School } from '../entities/school.entity';

@Module({
  imports: [TypeOrmModule.forFeature([City, Province, School])],
  controllers: [CityController],
  providers: [CityService],
  exports: [CityService, TypeOrmModule],
})
export class CityModule {}
