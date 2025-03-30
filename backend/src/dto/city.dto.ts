export class CreateCityDto {
  readonly name: string;
  readonly provinceId: number;
}

export class UpdateCityDto {
  readonly name?: string;
  readonly provinceId?: number;
}
