import { HttpException, HttpStatus } from '@nestjs/common';

export class DatabaseException extends HttpException {
  constructor(message: string = 'A database error occurred') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class ForeignKeyConstraintException extends HttpException {
  constructor(message: string = 'Referenced record does not exist') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class DuplicateEntryException extends HttpException {
  constructor(entity: string, field: string, value: string) {
    super(
      `${entity} with ${field} '${value}' already exists`,
      HttpStatus.CONFLICT,
    );
  }
}

export class UserEmailExistsException extends HttpException {
  constructor(email: string) {
    super(`User with email '${email}' already exists`, HttpStatus.CONFLICT);
  }
}

export class SchoolNameExistsException extends HttpException {
  constructor(name: string) {
    super(`School with name '${name}' already exists`, HttpStatus.CONFLICT);
  }
}

export class CityNameExistsException extends HttpException {
  constructor(name: string) {
    super(`City with name '${name}' already exists`, HttpStatus.CONFLICT);
  }
}

export class ProvinceNameExistsException extends HttpException {
  constructor(name: string) {
    super(`Province with name '${name}' already exists`, HttpStatus.CONFLICT);
  }
}

export class DepartmentNameExistsException extends HttpException {
  constructor(name: string) {
    super(`Department with name '${name}' already exists`, HttpStatus.CONFLICT);
  }
}
