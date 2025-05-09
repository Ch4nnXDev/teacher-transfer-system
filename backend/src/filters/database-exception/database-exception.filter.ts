import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { FilterRequest } from 'src/interfaces/request/request.interface';
import { QueryFailedError, EntityNotFoundError, TypeORMError } from 'typeorm';

// Type definition for MySQL error
interface MySQLError {
  code: string;
  name: string;
  message: string;
  sqlMessage: string;
}

// TypeORM QueryFailedError with driverError
interface QueryFailedErrorWithDriver extends QueryFailedError {
  driverError: MySQLError;
}

@Catch(QueryFailedError, EntityNotFoundError, TypeORMError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: TypeORMError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<FilterRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database Error';
    let errorDetails: Record<string, unknown> = {};

    // Log the error for debugging
    this.logger.error(
      `Database Exception at ${request.method} ${request.url}`,
      exception.stack,
    );

    if (exception instanceof QueryFailedError) {
      const queryError = exception as QueryFailedErrorWithDriver;

      if (queryError.driverError) {
        const driverError = queryError.driverError;

        // Handle specific MySQL error codes
        switch (driverError.code) {
          case 'ER_DUP_ENTRY':
            status = HttpStatus.CONFLICT;
            message = 'Duplicate entry';
            errorDetails = {
              error: 'A record with this data already exists',
              sqlMessage: driverError.sqlMessage,
            };
            break;

          case 'ER_NO_REFERENCED_ROW_2':
          case 'ER_NO_REFERENCED_ROW':
            status = HttpStatus.BAD_REQUEST;
            message = 'Foreign key constraint error';
            errorDetails = {
              error: 'The referenced record does not exist',
              sqlMessage: driverError.sqlMessage,
            };
            break;

          default:
            errorDetails = {
              error: 'Database query failed',
              sqlMessage: driverError.sqlMessage,
            };
        }
      }
    } else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Entity not found';
      errorDetails = {
        error: 'The requested entity was not found',
      };
    }

    // Create the error response
    const errorResponse = {
      success: false,
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      ...errorDetails,
    };

    response.status(status).json(errorResponse);
  }
}
