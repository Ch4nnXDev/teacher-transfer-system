import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsIn,
  IsNumber,
  MinLength,
  IsPositive,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  readonly name: string;

  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  readonly email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  readonly password: string;

  @IsString()
  @IsNotEmpty({ message: 'Role is required' })
  @IsIn(['admin', 'teacher', 'principal', 'staff'], {
    message: 'Role must be admin, teacher, principal, or staff',
  })
  readonly role: string;

  @IsString()
  @IsOptional()
  readonly employeeId?: string;

  @IsString()
  @IsOptional()
  readonly qualifications?: string;

  @IsISO8601()
  @IsOptional()
  @Type(() => Date)
  readonly joiningDate?: Date;

  @IsNumber()
  @IsOptional()
  @IsPositive({ message: 'School ID must be a positive number' })
  readonly schoolId?: number;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  readonly name?: string;

  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsOptional()
  readonly email?: string;

  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  readonly password?: string;

  @IsString()
  @IsOptional()
  @IsIn(['admin', 'teacher', 'principal', 'staff'], {
    message: 'Role must be admin, teacher, principal, or staff',
  })
  readonly role?: string;

  @IsString()
  @IsOptional()
  readonly employeeId?: string;

  @IsString()
  @IsOptional()
  readonly qualifications?: string;

  @IsISO8601()
  @IsOptional()
  @Type(() => Date)
  readonly joiningDate?: Date;

  @IsNumber()
  @IsOptional()
  @IsPositive({ message: 'School ID must be a positive number' })
  readonly schoolId?: number;
}

export class LoginUserDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  readonly email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  readonly password: string;
}
