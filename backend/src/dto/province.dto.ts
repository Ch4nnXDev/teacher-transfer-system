import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProvinceDto {
  @IsString()
  @IsNotEmpty({ message: 'Province name is required' })
  readonly name: string;
}

export class UpdateProvinceDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Province name cannot be empty' })
  readonly name?: string;
}
