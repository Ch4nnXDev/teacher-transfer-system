import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProvinceService } from './province.service';
import { CreateProvinceDto, UpdateProvinceDto } from '../dto/province.dto';
import { Province } from '../entities/province.entity';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { Roles } from '../auth/roles.decorator';
// import { RolesGuard } from '../auth/roles.guard';

@Controller('provinces')
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('it_admin', 'zonal_director')
  create(@Body() createProvinceDto: CreateProvinceDto): Promise<Province> {
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
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('it_admin', 'zonal_director')
  update(
    @Param('id') id: string,
    @Body() updateProvinceDto: UpdateProvinceDto,
  ): Promise<Province> {
    return this.provinceService.update(+id, updateProvinceDto);
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('it_admin')
  remove(@Param('id') id: string): Promise<void> {
    return this.provinceService.remove(+id);
  }
}
