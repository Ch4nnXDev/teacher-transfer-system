import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsPositive,
  MinLength,
  Matches,
} from 'class-validator';
import { AssignableUserRole } from '../interfaces/entity.interface';
import { IsAssignableUserRole } from 'src/validators/assignable-user-role.validator';

// User DTOs
export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'NIC is required' })
  @Matches(/^((\d{9}[vVxX])|(\d{12}))$/, {
    message:
      'Invalid NIC format. Must be either old format (9 digits + V/X) or new format (12 digits)',
  })
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

  @IsAssignableUserRole()
  readonly role: AssignableUserRole;

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

  @IsAssignableUserRole()
  @IsOptional()
  readonly role?: AssignableUserRole;

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
