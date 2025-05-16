import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super('Invalid credentials', HttpStatus.UNAUTHORIZED);
  }
}

export class InvalidTokenException extends HttpException {
  constructor() {
    super('Invalid or expired token', HttpStatus.UNAUTHORIZED);
  }
}

export class UnauthorizedAccessException extends HttpException {
  constructor(
    message: string = 'You do not have permission to access this resource',
  ) {
    super(message, HttpStatus.FORBIDDEN);
  }
}
