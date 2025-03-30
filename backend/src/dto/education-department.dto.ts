export class CreateEducationDepartmentDto {
  readonly name: string;
  readonly type: string;
}

export class UpdateEducationDepartmentDto {
  readonly name?: string;
  readonly type?: string;
}

// src/dto/school.dto.ts
export class CreateSchoolDto {
  readonly name: string;
  readonly address: string;
  readonly type: string;
  readonly cityId: number;
  readonly departmentId: number;
}

export class UpdateSchoolDto {
  readonly name?: string;
  readonly address?: string;
  readonly type?: string;
  readonly cityId?: number;
  readonly departmentId?: number;
}
