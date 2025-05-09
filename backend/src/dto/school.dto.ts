import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsIn,
  IsPositive,
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
  @IsIn(['public', 'private', 'charter'], {
    message: 'Type must be public, private, or charter',
  })
  readonly type: string;

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
  @IsIn(['public', 'private', 'charter'], {
    message: 'Type must be public, private, or charter',
  })
  readonly type?: string;

  @IsNumber()
  @IsOptional()
  @IsPositive({ message: 'City ID must be a positive number' })
  readonly cityId?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive({ message: 'Department ID must be a positive number' })
  readonly departmentId?: number;
}
