import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsPositive,
  MinLength,
  Matches,
  IsNotIn,
} from 'class-validator';
import { UserRole } from '../interfaces/entity.interface';

// User DTOs
export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'NIC is required' })
  @Matches(/^[0-9]{9}[vVxX]$|^[0-9]{12}$/, { message: 'Invalid NIC format' })
  readonly nic: string;

  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  readonly firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  readonly lastName: string;

  @IsNumber()
  @IsPositive({ message: 'Age must be a positive number' })
  readonly age: number;

  @IsDateString()
  @IsNotEmpty({ message: 'Birth date is required' })
  readonly birth: string;

  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  readonly email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  readonly password: string;

  @IsEnum(UserRole, { message: 'Invalid role' })
  @IsNotIn([UserRole.PAP], { message: 'PAP role cannot be assigned to users' })
  readonly role: UserRole;

  @IsString()
  @IsOptional()
  readonly employeeId?: string;

  @IsString()
  @IsOptional()
  readonly qualifications?: string;

  @IsDateString()
  @IsOptional()
  readonly joiningDate?: string;

  @IsString()
  @IsOptional()
  readonly address?: string;

  @IsNumber()
  @IsOptional()
  readonly latitude?: number;

  @IsNumber()
  @IsOptional()
  readonly longitude?: number;

  @IsString()
  @IsOptional()
  readonly phoneNumber?: string;

  @IsNumber()
  @IsOptional()
  @IsPositive({ message: 'School ID must be a positive number' })
  readonly currentSchoolId?: number;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'First name cannot be empty' })
  readonly firstName?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Last name cannot be empty' })
  readonly lastName?: string;

  @IsNumber()
  @IsOptional()
  @IsPositive({ message: 'Age must be a positive number' })
  readonly age?: number;

  @IsDateString()
  @IsOptional()
  readonly birth?: string;

  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsOptional()
  readonly email?: string;

  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  readonly password?: string;

  @IsEnum(UserRole, { message: 'Invalid role' })
  @IsNotIn([UserRole.PAP], { message: 'PAP role cannot be assigned to users' })
  @IsOptional()
  readonly role?: UserRole;

  @IsString()
  @IsOptional()
  readonly employeeId?: string;

  @IsString()
  @IsOptional()
  readonly qualifications?: string;

  @IsDateString()
  @IsOptional()
  readonly joiningDate?: string;

  @IsString()
  @IsOptional()
  readonly address?: string;

  @IsNumber()
  @IsOptional()
  readonly latitude?: number;

  @IsNumber()
  @IsOptional()
  readonly longitude?: number;

  @IsString()
  @IsOptional()
  readonly phoneNumber?: string;

  @IsBoolean()
  @IsOptional()
  readonly isActive?: boolean;

  @IsNumber()
  @IsOptional()
  @IsPositive({ message: 'School ID must be a positive number' })
  readonly currentSchoolId?: number;
}
