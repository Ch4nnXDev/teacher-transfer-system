import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CityService } from './city.service';
import { CreateCityDto, UpdateCityDto } from '../dto/city.dto';
import { City } from '../entities/city.entity';
import { NotArrayPipePipe } from '../pipes/not-array-pipe/not-array-pipe.pipe';
import { Roles } from '../decorator/roles.decorator';
import { FlexibleAuthGuard } from 'src/guards/flexible-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserRole } from 'src/interfaces/entity.interface';
import { Public } from 'src/decorator/public.decorator';

@Controller('cities')
@UseGuards(FlexibleAuthGuard, RolesGuard)
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post()
  @Roles(UserRole.IT_ADMIN, UserRole.ZONAL_DIRECTOR)
  create(
    @Body(new NotArrayPipePipe()) createCityDto: CreateCityDto,
  ): Promise<City> {
    if (Array.isArray(createCityDto)) {
      throw new BadRequestException('Array input is not allowed');
    }
    return this.cityService.create(createCityDto);
  }

  @Get()
  findAll(): Promise<City[]> {
    return this.cityService.findAll();
  }

  @Get('search')
  findByName(@Query('name') name: string): Promise<City | null> {
    return this.cityService.findByName(name);
  }

  @Get('by-province/:provinceId')
  findByProvince(
    @Param('provinceId', ParseIntPipe) provinceId: number,
  ): Promise<City[]> {
    return this.cityService.findByProvince(provinceId);
  }

  @Get('needing-teachers')
  @Roles(UserRole.IT_ADMIN, UserRole.ZONAL_DIRECTOR)
  findCitiesNeedingTeachers(
    @Query('ratio') ratio: string = '30',
  ): Promise<City[]> {
    const ratioThreshold = parseFloat(ratio);
    return this.cityService.findCitiesWithSchoolsNeedingTeachers(
      ratioThreshold,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<City> {
    return this.cityService.findOne(id);
  }

  @Get(':id/statistics')
  @Roles(
    UserRole.IT_ADMIN,
    UserRole.ZONAL_DIRECTOR,
    UserRole.PRINCIPAL,
    UserRole.SCHOOL_ADMIN,
  )
  getStatistics(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.cityService.getCityStatistics(id);
  }

  @Patch(':id')
  @Roles(UserRole.IT_ADMIN, UserRole.ZONAL_DIRECTOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCityDto: UpdateCityDto,
  ): Promise<City> {
    if (Array.isArray(updateCityDto)) {
      throw new BadRequestException('Array input is not allowed');
    }
    return this.cityService.update(id, updateCityDto);
  }

  @Delete(':id')
  @Roles(UserRole.IT_ADMIN)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.cityService.remove(id);
  }

  // Public route example
  @Get('public/list')
  @Public()
  getPublicCityList(): Promise<City[]> {
    return this.cityService.findAll();
  }
}
