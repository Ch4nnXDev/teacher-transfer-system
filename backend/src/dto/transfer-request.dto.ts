import {
  IsNumber,
  IsPositive,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { TransferRequestStatus } from 'src/interfaces/entity.interface';

// Transfer Request DTOs
export class CreateTransferRequestDto {
  @IsNumber()
  @IsPositive({ message: 'Target school ID must be a positive number' })
  @IsNotEmpty({ message: 'Target school is required' })
  readonly targetSchoolId: number;

  @IsString()
  @IsOptional()
  readonly reason?: string;

  @IsString()
  @IsOptional()
  readonly remarks?: string;

  @IsDateString()
  @IsOptional()
  readonly requestedTransferDate?: string;
}

export class UpdateTransferRequestDto {
  @IsNumber()
  @IsOptional()
  @IsPositive({ message: 'Target school ID must be a positive number' })
  readonly targetSchoolId?: number;

  @IsString()
  @IsOptional()
  readonly reason?: string;

  @IsString()
  @IsOptional()
  readonly remarks?: string;

  @IsDateString()
  @IsOptional()
  readonly requestedTransferDate?: string;
}

export class ReviewTransferRequestDto {
  @IsEnum(TransferRequestStatus, { message: 'Invalid status' })
  readonly status: TransferRequestStatus;

  @IsString()
  @IsOptional()
  readonly schoolRemarks?: string;

  @IsString()
  @IsOptional()
  readonly zonalDirectorRemarks?: string;

  @IsDateString()
  @IsOptional()
  readonly approvedTransferDate?: string;
}
