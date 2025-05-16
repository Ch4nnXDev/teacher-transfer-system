import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { TransferService } from './transfer.service';
import { TransferRequest } from '../entities/transfer-request.entity';
import { School } from '../entities/school.entity';
import { Roles } from '../decorator/roles.decorator';
import {
  CreateTransferRequestDto,
  UpdateTransferRequestDto,
  ReviewTransferRequestDto,
} from 'src/dto/transfer-request.dto';
import { FlexibleAuthGuard } from 'src/guards/flexible-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { AuthenticatedRequest } from 'src/interfaces/auth.interface';
import { UserRole } from 'src/interfaces/entity.interface';
import { Public } from 'src/decorator/public.decorator';

@Controller('transfers')
@UseGuards(FlexibleAuthGuard, RolesGuard)
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post()
  @Roles(UserRole.TEACHER)
  create(
    @Body() createTransferRequestDto: CreateTransferRequestDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<TransferRequest> {
    return this.transferService.createTransferRequest(
      createTransferRequestDto,
      req.user.userId,
    );
  }

  @Get()
  @Roles(UserRole.IT_ADMIN, UserRole.ZONAL_DIRECTOR)
  findAll(): Promise<TransferRequest[]> {
    return this.transferService.findAll();
  }

  @Get('my-requests')
  @Roles(UserRole.TEACHER)
  findMyRequests(
    @Request() req: AuthenticatedRequest,
  ): Promise<TransferRequest[]> {
    return this.transferService.findTransferRequestsForTeacher(req.user.userId);
  }

  @Get('for-school/:schoolId')
  @Roles(
    UserRole.PRINCIPAL,
    UserRole.SCHOOL_ADMIN,
    UserRole.ZONAL_DIRECTOR,
    UserRole.IT_ADMIN,
  )
  findForSchool(
    @Param('schoolId', ParseIntPipe) schoolId: number,
  ): Promise<TransferRequest[]> {
    return this.transferService.findTransferRequestsForSchool(schoolId);
  }

  @Get('for-zonal-review')
  @Roles(UserRole.ZONAL_DIRECTOR, UserRole.IT_ADMIN)
  findForZonalReview(): Promise<TransferRequest[]> {
    return this.transferService.findTransferRequestsForZonal();
  }

  @Get('suggested-schools')
  @Roles(UserRole.TEACHER)
  getSuggestedSchools(@Request() req: AuthenticatedRequest): Promise<School[]> {
    return this.transferService.getSuggestedSchools(req.user.userId);
  }

  @Get('suggested-schools/:teacherId')
  @Roles(
    UserRole.PRINCIPAL,
    UserRole.SCHOOL_ADMIN,
    UserRole.ZONAL_DIRECTOR,
    UserRole.IT_ADMIN,
  )
  getSuggestedSchoolsForTeacher(
    @Param('teacherId', ParseIntPipe) teacherId: number,
  ): Promise<School[]> {
    return this.transferService.getSuggestedSchools(teacherId);
  }

  @Get(':id')
  @Roles(
    UserRole.TEACHER,
    UserRole.PRINCIPAL,
    UserRole.SCHOOL_ADMIN,
    UserRole.ZONAL_DIRECTOR,
    UserRole.IT_ADMIN,
  )
  findOne(@Param('id', ParseIntPipe) id: number): Promise<TransferRequest> {
    return this.transferService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransferRequestDto: UpdateTransferRequestDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<TransferRequest> {
    return this.transferService.updateTransferRequest(
      id,
      updateTransferRequestDto,
      req.user.userId,
    );
  }

  @Patch(':id/submit')
  @Roles(UserRole.TEACHER)
  submit(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ): Promise<TransferRequest> {
    return this.transferService.submitTransferRequest(id, req.user.userId);
  }

  @Patch(':id/review')
  @Roles(UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN, UserRole.ZONAL_DIRECTOR)
  review(
    @Param('id', ParseIntPipe) id: number,
    @Body() reviewTransferRequestDto: ReviewTransferRequestDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<TransferRequest> {
    return this.transferService.reviewTransferRequest(
      id,
      reviewTransferRequestDto,
      req.user.userId,
    );
  }

  // Public route example - Transfer statistics
  @Get('public/statistics')
  @Public()
  getPublicTransferStatistics(): { message: string } {
    return {
      message: 'Transfer statistics available for authenticated users only',
    };
  }
}
