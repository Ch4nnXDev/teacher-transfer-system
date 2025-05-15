import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ProvinceService } from './province.service';
import { CreateProvinceDto, UpdateProvinceDto } from '../dto/province.dto';
import { Province } from '../entities/province.entity';
import { Roles } from '../decorator/roles/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserRole } from 'src/interfaces/entity.interface';

@Controller('provinces')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  @Post()
  @Roles(UserRole.IT_ADMIN, UserRole.ZONAL_DIRECTOR)
  create(@Body() createProvinceDto: CreateProvinceDto): Promise<Province> {
    return this.provinceService.create(createProvinceDto);
  }

  @Get()
  findAll(): Promise<Province[]> {
    return this.provinceService.findAll();
  }

  @Get('search')
  findByName(@Query('name') name: string): Promise<Province | null> {
    return this.provinceService.findByName(name);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Province> {
    return this.provinceService.findOne(id);
  }

  @Get(':id/statistics')
  @Roles(
    UserRole.IT_ADMIN,
    UserRole.ZONAL_DIRECTOR,
    UserRole.PRINCIPAL,
    UserRole.SCHOOL_ADMIN,
  )
  getStatistics(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.provinceService.getProvinceStatistics(id);
  }

  @Patch(':id')
  @Roles(UserRole.IT_ADMIN, UserRole.ZONAL_DIRECTOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProvinceDto: UpdateProvinceDto,
  ): Promise<Province> {
    return this.provinceService.update(id, updateProvinceDto);
  }

  @Delete(':id')
  @Roles(UserRole.IT_ADMIN)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.provinceService.remove(id);
  }
}
