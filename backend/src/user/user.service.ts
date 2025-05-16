import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { School } from '../entities/school.entity';
import { TeacherAssignment } from '../entities/teacher-assignment.entity';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { AuthenticatedRequest } from 'src/interfaces/auth.interface';
import {
  UserRole,
  TeacherAssignmentStatus,
  TeacherLeavingReason,
} from 'src/interfaces/entity.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(School)
    private schoolRepository: Repository<School>,
    @InjectRepository(TeacherAssignment)
    private teacherAssignmentRepository: Repository<TeacherAssignment>,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    authenticatedUser?: AuthenticatedRequest['user'],
  ): Promise<User> {
    const { currentSchoolId, password, ...userData } = createUserDto;

    // Check if email already exists
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email: userData.email },
    });
    if (existingUserByEmail) {
      throw new ConflictException(
        `User with email ${userData.email} already exists`,
      );
    }

    // Check if NIC already exists
    const existingUserByNIC = await this.userRepository.findOne({
      where: { nic: userData.nic },
    });
    if (existingUserByNIC) {
      throw new ConflictException(
        `User with NIC ${userData.nic} already exists`,
      );
    }

    // Validate role permissions (skip for system auth)
    if (authenticatedUser) {
      this.validateUserCreationPermissions(
        authenticatedUser.role as UserRole,
        userData.role,
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle joiningDate properly - either new Date or undefined
    const joiningDate = userData.joiningDate
      ? new Date(userData.joiningDate)
      : undefined;

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      birth: new Date(userData.birth),
      joiningDate,
    });

    // Handle school assignment for teachers
    if (currentSchoolId && userData.role === UserRole.TEACHER) {
      const school = await this.schoolRepository.findOne({
        where: { id: currentSchoolId },
      });
      if (!school) {
        throw new NotFoundException(
          `School with ID ${currentSchoolId} not found`,
        );
      }
      user.currentSchool = school;
    }

    const savedUser = await this.userRepository.save(user);

    // Create teacher assignment record if user is a teacher
    if (savedUser.currentSchool && savedUser.role === UserRole.TEACHER) {
      await this.createTeacherAssignment(savedUser, savedUser.currentSchool);
    }

    return savedUser;
  }

  private validateUserCreationPermissions(
    creatorRole: UserRole,
    targetRole: UserRole,
  ): void {
    // Define role hierarchy permissions
    const permissions: Record<UserRole, UserRole[]> = {
      [UserRole.IT_ADMIN]: [
        UserRole.IT_ADMIN,
        UserRole.ZONAL_DIRECTOR,
        UserRole.PRINCIPAL,
        UserRole.SCHOOL_ADMIN,
        UserRole.TEACHER,
        UserRole.STAFF,
      ],
      [UserRole.ZONAL_DIRECTOR]: [
        UserRole.PRINCIPAL,
        UserRole.SCHOOL_ADMIN,
        UserRole.TEACHER,
        UserRole.STAFF,
      ],
      [UserRole.PRINCIPAL]: [UserRole.TEACHER, UserRole.STAFF],
      [UserRole.SCHOOL_ADMIN]: [],
      [UserRole.TEACHER]: [],
      [UserRole.STAFF]: [],
    };

    const allowedRoles = permissions[creatorRole] || [];

    if (!allowedRoles.includes(targetRole)) {
      throw new ForbiddenException(
        `You cannot create users with role: ${targetRole}`,
      );
    }
  }

  private async createTeacherAssignment(
    teacher: User,
    school: School,
  ): Promise<TeacherAssignment> {
    const assignment = this.teacherAssignmentRepository.create({
      teacher,
      school,
      startDate: teacher.joiningDate || new Date(),
      status: TeacherAssignmentStatus.ACTIVE,
    });

    return this.teacherAssignmentRepository.save(assignment);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: [
        'currentSchool',
        'currentSchool.city',
        'currentSchool.department',
      ],
      select: [
        'id',
        'nic',
        'firstName',
        'lastName',
        'age',
        'birth',
        'email',
        'role',
        'employeeId',
        'qualifications',
        'joiningDate',
        'address',
        'phoneNumber',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.userRepository.find({
      where: { role },
      relations: [
        'currentSchool',
        'currentSchool.city',
        'currentSchool.department',
      ],
      select: [
        'id',
        'nic',
        'firstName',
        'lastName',
        'age',
        'birth',
        'email',
        'role',
        'employeeId',
        'qualifications',
        'joiningDate',
        'address',
        'phoneNumber',
        'isActive',
      ],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'currentSchool',
        'currentSchool.city',
        'currentSchool.department',
        'assignments',
        'assignments.school',
        'transferRequests',
        'transferRequests.targetSchool',
      ],
      select: [
        'id',
        'nic',
        'firstName',
        'lastName',
        'age',
        'birth',
        'email',
        'role',
        'employeeId',
        'qualifications',
        'joiningDate',
        'address',
        'latitude',
        'longitude',
        'phoneNumber',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['currentSchool'],
      select: [
        'id',
        'nic',
        'firstName',
        'lastName',
        'email',
        'password',
        'role',
        'isActive',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    authenticatedUser?: AuthenticatedRequest['user'],
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['currentSchool'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { currentSchoolId, password, birth, joiningDate, ...userData } =
      updateUserDto;

    // Validate role change permissions (skip for system auth)
    if (userData.role && authenticatedUser) {
      this.validateUserCreationPermissions(
        authenticatedUser.role as UserRole,
        userData.role,
      );
    }

    // Create update object with proper typing
    const updateData: Partial<User> = {
      ...userData,
    };

    // Handle password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Handle date fields properly
    if (birth) {
      updateData.birth = new Date(birth);
    }
    if (joiningDate) {
      updateData.joiningDate = new Date(joiningDate);
    }

    // Handle school change for teachers
    if (currentSchoolId !== undefined) {
      if (currentSchoolId) {
        const school = await this.schoolRepository.findOne({
          where: { id: currentSchoolId },
        });
        if (!school) {
          throw new NotFoundException(
            `School with ID ${currentSchoolId} not found`,
          );
        }

        // If school is changing for a teacher, update assignments
        if (
          user.role === UserRole.TEACHER &&
          user.currentSchool?.id !== currentSchoolId
        ) {
          await this.updateTeacherSchoolAssignment(user, school);
        }

        user.currentSchool = school;
      } else {
        user.currentSchool = null;
      }
    }

    // Apply updates to user entity
    Object.assign(user, updateData);

    return this.userRepository.save(user);
  }

  private async updateTeacherSchoolAssignment(
    teacher: User,
    newSchool: School,
  ): Promise<void> {
    // Complete current assignment
    if (teacher.currentSchool) {
      const currentAssignment = await this.teacherAssignmentRepository.findOne({
        where: {
          teacher: { id: teacher.id },
          school: { id: teacher.currentSchool.id },
          status: TeacherAssignmentStatus.ACTIVE,
        },
      });

      if (currentAssignment) {
        currentAssignment.endDate = new Date();
        currentAssignment.status = TeacherAssignmentStatus.COMPLETED;
        currentAssignment.leavingReason = TeacherLeavingReason.TRANSFER;
        await this.teacherAssignmentRepository.save(currentAssignment);
      }
    }

    // Create new assignment
    await this.createTeacherAssignment(teacher, newSchool);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);

    // Soft delete by setting isActive to false
    user.isActive = false;
    await this.userRepository.save(user);
  }

  async findTeachersEligibleForTransfer(): Promise<User[]> {
    // Find teachers who have been at their current school for 5+ years
    const teachersWithAssignments = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.currentSchool', 'school')
      .leftJoinAndSelect('user.assignments', 'assignment')
      .where('user.role = :role', { role: UserRole.TEACHER })
      .andWhere('user.isActive = :active', { active: true })
      .andWhere('assignment.status = :status', {
        status: TeacherAssignmentStatus.ACTIVE,
      })
      .andWhere('assignment.startDate <= :fiveYearsAgo', {
        fiveYearsAgo: new Date(Date.now() - 5 * 365.25 * 24 * 60 * 60 * 1000),
      })
      .getMany();

    return teachersWithAssignments;
  }
}
