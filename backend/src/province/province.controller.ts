import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProvinceService } from './province.service';
import { CreateProvinceDto, UpdateProvinceDto } from '../dto/province.dto';
import { Province } from '../entities/province.entity';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../decorator/roles/roles.decorator';
import { RolesGuard } from '../guards/roles/roles.guard';
import { ArrayInputException } from 'src/exceptions/validation-exceptions/validation.exceptions';

@Controller('provinces')
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('it_admin', 'zonal_director')
  create(@Body() createProvinceDto: CreateProvinceDto): Promise<Province> {
    if (Array.isArray(createProvinceDto)) {
      throw new ArrayInputException();
    }
    return this.provinceService.create(createProvinceDto);
  }

  @Get()
  findAll(): Promise<Province[]> {
    return this.provinceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Province> {
    return this.provinceService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('it_admin', 'zonal_director')
  update(
    @Param('id') id: string,
    @Body() updateProvinceDto: UpdateProvinceDto,
  ): Promise<Province> {
    if (Array.isArray(updateProvinceDto)) {
      throw new ArrayInputException();
    }
    return this.provinceService.update(+id, updateProvinceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('it_admin')
  remove(@Param('id') id: string): Promise<void> {
    return this.provinceService.remove(+id);
  }
}
