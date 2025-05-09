import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidDataException extends HttpException {
  constructor(message: string = 'Invalid data provided') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class ArrayInputException extends HttpException {
  constructor() {
    super('Array input is not allowed', HttpStatus.BAD_REQUEST);
  }
}

export class EmptyValueException extends HttpException {
  constructor(field: string) {
    super(`${field} cannot be empty`, HttpStatus.BAD_REQUEST);
  }
}

export class InvalidFormatException extends HttpException {
  constructor(field: string, format: string) {
    super(`${field} must be in ${format} format`, HttpStatus.BAD_REQUEST);
  }
}

export class MissingRequiredFieldException extends HttpException {
  constructor(field: string) {
    super(`${field} is required`, HttpStatus.BAD_REQUEST);
  }
}
