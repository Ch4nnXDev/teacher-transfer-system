import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvinceController } from './province.controller';
import { ProvinceService } from './province.service';
import { Province } from '../entities/province.entity';
import { City } from '../entities/city.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Province, City])],
  controllers: [ProvinceController],
  providers: [ProvinceService],
  exports: [ProvinceService, TypeOrmModule],
})
export class ProvinceModule {}
