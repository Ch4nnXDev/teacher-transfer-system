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
import { CityService } from './city.service';
import { CreateCityDto, UpdateCityDto } from '../dto/city.dto';
import { City } from '../entities/city.entity';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../decorator/roles/roles.decorator';
import { RolesGuard } from '../guards/roles/roles.guard';
import { ArrayInputException } from 'src/exceptions/validation-exceptions/validation.exceptions';

@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('it_admin', 'zonal_director')
  create(@Body() createCityDto: CreateCityDto): Promise<City> {
    if (Array.isArray(createCityDto)) {
      throw new ArrayInputException();
    }
    return this.cityService.create(createCityDto);
  }

  @Get()
  findAll(): Promise<City[]> {
    return this.cityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<City> {
    return this.cityService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('it_admin', 'zonal_director')
  update(
    @Param('id') id: string,
    @Body() updateCityDto: UpdateCityDto,
  ): Promise<City> {
    if (Array.isArray(updateCityDto)) {
      throw new ArrayInputException();
    }
    return this.cityService.update(+id, updateCityDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('it_admin')
  remove(@Param('id') id: string): Promise<void> {
    return this.cityService.remove(+id);
  }
}
