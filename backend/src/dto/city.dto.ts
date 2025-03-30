import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class CreateCityDto {
  @IsString()
  @IsNotEmpty({ message: 'City name is required' })
  readonly name: string;

  @IsNumber()
  @IsPositive({ message: 'Province ID must be a positive number' })
  @IsNotEmpty({ message: 'Province ID is required' })
  readonly provinceId: number;
}

export class UpdateCityDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'City name cannot be empty' })
  readonly name?: string;

  @IsNumber()
  @IsOptional()
  @IsPositive({ message: 'Province ID must be a positive number' })
  readonly provinceId?: number;
}
