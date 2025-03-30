import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CityService } from './city.service';
import { CreateCityDto, UpdateCityDto } from '../dto/city.dto';
import { City } from '../entities/city.entity';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { Roles } from '../auth/roles.decorator';
// import { RolesGuard } from '../auth/roles.guard';

@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('it_admin', 'zonal_director')
  create(@Body() createCityDto: CreateCityDto): Promise<City> {
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
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('it_admin', 'zonal_director')
  update(
    @Param('id') id: string,
    @Body() updateCityDto: UpdateCityDto,
  ): Promise<City> {
    return this.cityService.update(+id, updateCityDto);
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('it_admin')
  remove(@Param('id') id: string): Promise<void> {
    return this.cityService.remove(+id);
  }
}
