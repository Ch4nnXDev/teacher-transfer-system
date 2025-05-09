import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(id?: number | string) {
    super(`User with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class UserEmailNotFoundException extends HttpException {
  constructor(email: string) {
    super(`User with email '${email}' not found`, HttpStatus.NOT_FOUND);
  }
}

export class SchoolNotFoundException extends HttpException {
  constructor(id?: number | string) {
    super(`School with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class CityNotFoundException extends HttpException {
  constructor(id?: number | string) {
    super(`City with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class ProvinceNotFoundException extends HttpException {
  constructor(id?: number | string) {
    super(`Province with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class DepartmentNotFoundException extends HttpException {
  constructor(id?: number | string) {
    super(`Education Department with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}
