export class CreateUserDto {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly role: string;
  readonly employeeId?: string;
  readonly qualifications?: string;
  readonly joiningDate?: Date;
  readonly schoolId?: number;
}

export class UpdateUserDto {
  readonly name?: string;
  readonly email?: string;
  readonly password?: string;
  readonly role?: string;
  readonly employeeId?: string;
  readonly qualifications?: string;
  readonly joiningDate?: Date;
  readonly schoolId?: number;
}

export class LoginUserDto {
  readonly email: string;
  readonly password: string;
}
