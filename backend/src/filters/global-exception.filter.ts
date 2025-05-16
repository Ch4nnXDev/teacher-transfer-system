import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from 'src/interfaces/response.interface';

// Global exception filter for non-HTTP exceptions
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Default to internal server error
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Operation failed',
      timestamp: new Date().toISOString(),
      error: message,
      statusCode: status,
    };

    response.status(status).json(errorResponse);
  }
}
