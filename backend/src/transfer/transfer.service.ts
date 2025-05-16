import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransferRequest } from '../entities/transfer-request.entity';
import { User } from '../entities/user.entity';
import { School } from '../entities/school.entity';
import { TeacherAssignment } from '../entities/teacher-assignment.entity';
import {
  CreateTransferRequestDto,
  UpdateTransferRequestDto,
  ReviewTransferRequestDto,
} from 'src/dto/transfer-request.dto';
import {
  UserRole,
  TeacherAssignmentStatus,
  TransferRequestStatus,
} from 'src/interfaces/entity.interface';

@Injectable()
export class TransferService {
  constructor(
    @InjectRepository(TransferRequest)
    private transferRequestRepository: Repository<TransferRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(School)
    private schoolRepository: Repository<School>,
    @InjectRepository(TeacherAssignment)
    private teacherAssignmentRepository: Repository<TeacherAssignment>,
  ) {}

  async createTransferRequest(
    createDto: CreateTransferRequestDto,
    teacherId: number,
  ): Promise<TransferRequest> {
    const teacher = await this.userRepository.findOne({
      where: { id: teacherId },
      relations: ['currentSchool', 'assignments'],
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    if (teacher.role !== UserRole.TEACHER) {
      throw new BadRequestException(
        'Only teachers can create transfer requests',
      );
    }

    // Check if teacher has an active assignment
    const activeAssignment = await this.teacherAssignmentRepository.findOne({
      where: {
        teacher: { id: teacherId },
        status: TeacherAssignmentStatus.ACTIVE,
      },
      relations: ['school'],
    });

    if (!activeAssignment) {
      throw new BadRequestException(
        'Teacher must have an active assignment to request transfer',
      );
    }

    // Calculate years at current school for eligibility
    const yearsAtCurrentSchool = activeAssignment.yearsOfService;
    const isEligible = yearsAtCurrentSchool >= 5;

    // Get target school
    const targetSchool = await this.schoolRepository.findOne({
      where: { id: createDto.targetSchoolId },
      relations: ['city'],
    });

    if (!targetSchool) {
      throw new NotFoundException(
        `School with ID ${createDto.targetSchoolId} not found`,
      );
    }

    // Calculate distance from teacher's residence to target school
    const distance = this.calculateDistance(teacher, targetSchool);

    // Create transfer request manually to avoid DeepPartial issues
    const transferRequest = new TransferRequest();
    transferRequest.teacher = teacher;
    transferRequest.targetSchool = targetSchool;
    transferRequest.reason = createDto.reason || null;
    transferRequest.remarks = createDto.remarks || null;
    transferRequest.requestedTransferDate = createDto.requestedTransferDate
      ? new Date(createDto.requestedTransferDate)
      : null;
    transferRequest.yearsAtCurrentSchool = yearsAtCurrentSchool;
    transferRequest.isEligible = isEligible;
    transferRequest.distanceFromResidence = distance;
    transferRequest.targetSchoolRatio = targetSchool.studentTeacherRatio;
    transferRequest.status = TransferRequestStatus.DRAFT;

    return this.transferRequestRepository.save(transferRequest);
  }

  async updateTransferRequest(
    id: number,
    updateDto: UpdateTransferRequestDto,
    userId: number,
  ): Promise<TransferRequest> {
    const transferRequest = await this.transferRequestRepository.findOne({
      where: { id },
      relations: ['teacher', 'targetSchool'],
    });

    if (!transferRequest) {
      throw new NotFoundException(`Transfer request with ID ${id} not found`);
    }

    // Check if user owns this transfer request
    if (transferRequest.teacher.id !== userId) {
      throw new ForbiddenException(
        'You can only update your own transfer requests',
      );
    }

    // Check if request can be updated
    if (!transferRequest.canBeUpdated()) {
      throw new BadRequestException(
        'Transfer request cannot be updated in its current status',
      );
    }

    // Update target school if provided
    if (updateDto.targetSchoolId) {
      const targetSchool = await this.schoolRepository.findOne({
        where: { id: updateDto.targetSchoolId },
      });
      if (!targetSchool) {
        throw new NotFoundException(
          `School with ID ${updateDto.targetSchoolId} not found`,
        );
      }
      transferRequest.targetSchool = targetSchool;

      // Recalculate distance and ratio
      transferRequest.distanceFromResidence = this.calculateDistance(
        transferRequest.teacher,
        targetSchool,
      );
      transferRequest.targetSchoolRatio = targetSchool.studentTeacherRatio;
    }

    // Update other fields
    if (updateDto.reason !== undefined)
      transferRequest.reason = updateDto.reason;
    if (updateDto.remarks !== undefined)
      transferRequest.remarks = updateDto.remarks;
    if (updateDto.requestedTransferDate) {
      transferRequest.requestedTransferDate = new Date(
        updateDto.requestedTransferDate,
      );
    }

    return this.transferRequestRepository.save(transferRequest);
  }

  async submitTransferRequest(
    id: number,
    userId: number,
  ): Promise<TransferRequest> {
    const transferRequest = await this.transferRequestRepository.findOne({
      where: { id },
      relations: ['teacher'],
    });

    if (!transferRequest) {
      throw new NotFoundException(`Transfer request with ID ${id} not found`);
    }

    if (transferRequest.teacher.id !== userId) {
      throw new ForbiddenException(
        'You can only submit your own transfer requests',
      );
    }

    if (!transferRequest.canBeSubmitted()) {
      if (!transferRequest.isEligible) {
        throw new BadRequestException(
          'Teacher is not eligible for transfer (must have 5+ years at current school)',
        );
      }
      throw new BadRequestException(
        'Transfer request cannot be submitted in its current status',
      );
    }

    transferRequest.status = TransferRequestStatus.SUBMITTED;
    transferRequest.submittedAt = new Date();

    return this.transferRequestRepository.save(transferRequest);
  }

  async reviewTransferRequest(
    id: number,
    reviewDto: ReviewTransferRequestDto,
    reviewerId: number,
  ): Promise<TransferRequest> {
    const transferRequest = await this.transferRequestRepository.findOne({
      where: { id },
      relations: ['teacher', 'targetSchool', 'teacher.currentSchool'],
    });

    if (!transferRequest) {
      throw new NotFoundException(`Transfer request with ID ${id} not found`);
    }

    const reviewer = await this.userRepository.findOne({
      where: { id: reviewerId },
      relations: ['currentSchool'],
    });

    if (!reviewer) {
      throw new NotFoundException(`Reviewer with ID ${reviewerId} not found`);
    }

    // Handle different review stages
    switch (reviewDto.status) {
      case TransferRequestStatus.SCHOOL_REVIEWED:
        this.validateSchoolReview(transferRequest, reviewer);
        transferRequest.schoolRemarks = reviewDto.schoolRemarks || null;
        transferRequest.reviewedBySchool = reviewer;
        transferRequest.reviewedBySchoolAt = new Date();
        break;

      case TransferRequestStatus.FORWARDED_TO_ZONAL:
        this.validateForwardToZonal(transferRequest, reviewer);
        transferRequest.forwardedToZonalAt = new Date();
        break;

      case TransferRequestStatus.APPROVED:
      case TransferRequestStatus.REJECTED:
        this.validateZonalReview(transferRequest, reviewer);
        transferRequest.zonalDirectorRemarks =
          reviewDto.zonalDirectorRemarks || null;
        transferRequest.reviewedByZonal = reviewer;
        transferRequest.finalizedAt = new Date();
        if (
          reviewDto.status === TransferRequestStatus.APPROVED &&
          reviewDto.approvedTransferDate
        ) {
          transferRequest.approvedTransferDate = new Date(
            reviewDto.approvedTransferDate,
          );
        }
        break;

      default:
        throw new BadRequestException(
          `Invalid status transition: ${reviewDto.status}`,
        );
    }

    transferRequest.status = reviewDto.status;
    return this.transferRequestRepository.save(transferRequest);
  }

  private validateSchoolReview(
    transferRequest: TransferRequest,
    reviewer: User,
  ): void {
    if (transferRequest.status !== TransferRequestStatus.SUBMITTED) {
      throw new BadRequestException(
        'Transfer request must be submitted before school review',
      );
    }

    // Check if reviewer is from the same school as the teacher
    if (
      !reviewer.currentSchool ||
      !transferRequest.teacher.currentSchool ||
      reviewer.currentSchool.id !== transferRequest.teacher.currentSchool.id
    ) {
      throw new ForbiddenException(
        'You can only review requests from your school',
      );
    }

    // Check if reviewer has appropriate role
    if (![UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN].includes(reviewer.role)) {
      throw new ForbiddenException(
        'Only principals and school admins can review transfer requests',
      );
    }
  }

  private validateForwardToZonal(
    transferRequest: TransferRequest,
    reviewer: User,
  ): void {
    if (transferRequest.status !== TransferRequestStatus.SCHOOL_REVIEWED) {
      throw new BadRequestException(
        'Transfer request must be reviewed by school before forwarding',
      );
    }

    if (![UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN].includes(reviewer.role)) {
      throw new ForbiddenException(
        'Only principals and school admins can forward to zonal director',
      );
    }
  }

  private validateZonalReview(
    transferRequest: TransferRequest,
    reviewer: User,
  ): void {
    if (transferRequest.status !== TransferRequestStatus.FORWARDED_TO_ZONAL) {
      throw new BadRequestException(
        'Transfer request must be forwarded to zonal director before final review',
      );
    }

    if (reviewer.role !== UserRole.ZONAL_DIRECTOR) {
      throw new ForbiddenException(
        'Only zonal directors can approve or reject transfer requests',
      );
    }
  }

  private calculateDistance(teacher: User, school: School): number {
    // Simple distance calculation using Haversine formula
    // Returns distance in kilometers

    if (
      !teacher.latitude ||
      !teacher.longitude ||
      !school.latitude ||
      !school.longitude
    ) {
      return 0; // Return 0 if coordinates are not available
    }

    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(school.latitude - teacher.latitude);
    const dLon = this.deg2rad(school.longitude - teacher.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(teacher.latitude)) *
        Math.cos(this.deg2rad(school.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async findTransferRequestsForTeacher(
    teacherId: number,
  ): Promise<TransferRequest[]> {
    return this.transferRequestRepository.find({
      where: { teacher: { id: teacherId } },
      relations: [
        'targetSchool',
        'targetSchool.city',
        'reviewedBySchool',
        'reviewedByZonal',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findTransferRequestsForSchool(
    schoolId: number,
  ): Promise<TransferRequest[]> {
    return this.transferRequestRepository.find({
      where: {
        teacher: { currentSchool: { id: schoolId } },
      },
      relations: ['teacher', 'targetSchool', 'targetSchool.city'],
      order: { createdAt: 'DESC' },
    });
  }

  async findTransferRequestsForZonal(): Promise<TransferRequest[]> {
    return this.transferRequestRepository.find({
      where: { status: TransferRequestStatus.FORWARDED_TO_ZONAL },
      relations: [
        'teacher',
        'teacher.currentSchool',
        'targetSchool',
        'targetSchool.city',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async getSuggestedSchools(teacherId: number): Promise<School[]> {
    const teacher = await this.userRepository.findOne({
      where: { id: teacherId },
      relations: [
        'currentSchool',
        'currentSchool.city',
        'currentSchool.department',
      ],
    });

    if (!teacher || !teacher.currentSchool) {
      throw new NotFoundException(
        'Teacher not found or not assigned to a school',
      );
    }

    // Get schools in the same education department, ordered by:
    // 1. Student-teacher ratio (descending - schools with more students per teacher get priority)
    // 2. Distance from teacher's residence (ascending - closer schools get priority)

    const schools = await this.schoolRepository
      .createQueryBuilder('school')
      .leftJoinAndSelect('school.city', 'city')
      .leftJoinAndSelect('school.department', 'department')
      .where('school.department.id = :departmentId', {
        departmentId: teacher.currentSchool.department.id,
      })
      .andWhere('school.id != :currentSchoolId', {
        currentSchoolId: teacher.currentSchool.id,
      })
      .andWhere('school.isActive = :active', { active: true })
      .getMany();

    // Calculate distances and sort
    const schoolsWithDistance = schools
      .map((school) => {
        const distance = this.calculateDistance(teacher, school);
        // Access the getter before spreading to preserve it
        const ratio = school.studentTeacherRatio;
        return {
          ...school,
          distanceFromTeacher: distance,
          studentTeacherRatio: ratio, // Explicitly include the ratio value
        };
      })
      .sort((a, b) => {
        // First sort by student-teacher ratio (descending)
        const ratioDiff = b.studentTeacherRatio - a.studentTeacherRatio;
        if (Math.abs(ratioDiff) > 0.1) {
          // Only prioritize if difference is significant
          return ratioDiff;
        }
        // Then sort by distance (ascending)
        return a.distanceFromTeacher - b.distanceFromTeacher;
      });

    // Return School objects (removing the extra distanceFromTeacher property)
    return schoolsWithDistance.slice(0, 10).map((schoolWithDistance) => {
      // Create a new School object without the distanceFromTeacher property
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { distanceFromTeacher, ...school } = schoolWithDistance;
      return school as School;
    });
  }

  async findAll(): Promise<TransferRequest[]> {
    return this.transferRequestRepository.find({
      relations: [
        'teacher',
        'teacher.currentSchool',
        'targetSchool',
        'targetSchool.city',
        'reviewedBySchool',
        'reviewedByZonal',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<TransferRequest> {
    const transferRequest = await this.transferRequestRepository.findOne({
      where: { id },
      relations: [
        'teacher',
        'teacher.currentSchool',
        'teacher.currentSchool.city',
        'targetSchool',
        'targetSchool.city',
        'reviewedBySchool',
        'reviewedByZonal',
      ],
    });

    if (!transferRequest) {
      throw new NotFoundException(`Transfer request with ID ${id} not found`);
    }

    return transferRequest;
  }
}
