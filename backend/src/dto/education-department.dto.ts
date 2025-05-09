import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class CreateEducationDepartmentDto {
  @IsString()
  @IsNotEmpty({ message: 'Department name is required' })
  readonly name: string;

  @IsString()
  @IsNotEmpty({ message: 'Department type is required' })
  @IsIn(['elementary', 'secondary', 'higher', 'special'], {
    message: 'Type must be elementary, secondary, higher, or special',
  })
  readonly type: string;
}

export class UpdateEducationDepartmentDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Department name cannot be empty' })
  readonly name?: string;

  @IsString()
  @IsOptional()
  @IsIn(['elementary', 'secondary', 'higher', 'special'], {
    message: 'Type must be elementary, secondary, higher, or special',
  })
  readonly type?: string;
}
