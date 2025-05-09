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
import { SchoolService } from './school.service';
import { CreateSchoolDto, UpdateSchoolDto } from '../dto/school.dto';
import { School } from '../entities/school.entity';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../decorator/roles/roles.decorator';
import { RolesGuard } from '../guards/roles/roles.guard';
import { ArrayInputException } from 'src/exceptions/validation-exceptions/validation.exceptions';

@Controller('schools')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('it_admin', 'zonal_director')
  create(@Body() createSchoolDto: CreateSchoolDto): Promise<School> {
    if (Array.isArray(createSchoolDto)) {
      throw new ArrayInputException();
    }
    return this.schoolService.create(createSchoolDto);
  }

  @Get()
  findAll(): Promise<School[]> {
    return this.schoolService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<School> {
    return this.schoolService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('it_admin', 'zonal_director', 'principal')
  update(
    @Param('id') id: string,
    @Body() updateSchoolDto: UpdateSchoolDto,
  ): Promise<School> {
    if (Array.isArray(updateSchoolDto)) {
      throw new ArrayInputException();
    }
    return this.schoolService.update(+id, updateSchoolDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('it_admin')
  remove(@Param('id') id: string): Promise<void> {
    return this.schoolService.remove(+id);
  }
}
