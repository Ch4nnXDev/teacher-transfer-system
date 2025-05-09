import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { FilterRequest } from 'src/interfaces/request/request.interface';

// Type for standard Error
interface StandardError extends Error {
  name: string;
  message: string;
  stack?: string;
}

@Catch()
export class UnhandledExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(UnhandledExceptionFilter.name);

  catch(exception: StandardError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<FilterRequest>();

    // Log the exception for debugging
    this.logger.error(
      `Unhandled Exception at ${request.method} ${request.url}`,
      exception.stack,
    );

    // Create error response
    const errorResponse = {
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      // Include additional error details in non-production environments
      ...(process.env.NODE_ENV !== 'production' && {
        error: {
          name: exception.name,
          message: exception.message,
        },
      }),
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}
