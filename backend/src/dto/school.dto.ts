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
