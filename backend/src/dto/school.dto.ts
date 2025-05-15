import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsEmail,
  IsBoolean,
} from 'class-validator';

export class CreateSchoolDto {
  @IsString()
  @IsNotEmpty({ message: 'School name is required' })
  readonly name: string;

  @IsString()
  @IsNotEmpty({ message: 'School address is required' })
  readonly address: string;

  @IsString()
  @IsNotEmpty({ message: 'School type is required' })
  readonly type: string;

  @IsNumber()
  @IsOptional()
  readonly latitude?: number;

  @IsNumber()
  @IsOptional()
  readonly longitude?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive({ message: 'Student count must be positive' })
  readonly studentCount?: number;

  @IsString()
  @IsOptional()
  readonly phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @IsNumber()
  @IsPositive({ message: 'City ID must be a positive number' })
  @IsNotEmpty({ message: 'City ID is required' })
  readonly cityId: number;

  @IsNumber()
  @IsPositive({ message: 'Department ID must be a positive number' })
  @IsNotEmpty({ message: 'Department ID is required' })
  readonly departmentId: number;
}

export class UpdateSchoolDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'School name cannot be empty' })
  readonly name?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'School address cannot be empty' })
  readonly address?: string;

  @IsString()
  @IsOptional()
  readonly type?: string;

  @IsNumber()
  @IsOptional()
  readonly latitude?: number;

  @IsNumber()
  @IsOptional()
  readonly longitude?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive({ message: 'Student count must be positive' })
  readonly studentCount?: number;

  @IsString()
  @IsOptional()
  readonly phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @IsBoolean()
  @IsOptional()
  readonly isActive?: boolean;

  @IsNumber()
  @IsOptional()
  @IsPositive({ message: 'City ID must be a positive number' })
  readonly cityId?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive({ message: 'Department ID must be a positive number' })
  readonly departmentId?: number;
}
