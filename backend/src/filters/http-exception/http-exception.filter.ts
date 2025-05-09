import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { FilterRequest } from 'src/interfaces/request/request.interface';

// Type for HTTP exception response
interface HttpExceptionResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
  [key: string]: unknown; // Add index signature
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<FilterRequest>();
    const status = exception.getStatus();

    // Get the exception response
    const exceptionResponse = exception.getResponse() as
      | HttpExceptionResponse
      | string;

    // Extract the error message
    let errorMessage: string;
    let errorDetails: Record<string, unknown> | undefined;

    if (typeof exceptionResponse === 'string') {
      errorMessage = exceptionResponse;
    } else {
      // For object responses with message property
      if (Array.isArray(exceptionResponse.message)) {
        errorMessage = exceptionResponse.message[0]; // Take first validation error
      } else if (typeof exceptionResponse.message === 'string') {
        errorMessage = exceptionResponse.message;
      } else {
        errorMessage = 'An error occurred';
      }

      // Include other fields from the exception response
      errorDetails = exceptionResponse;
    }

    // Log the exception
    this.logger.error(
      `HTTP Exception: ${errorMessage} at ${request.method} ${request.url}`,
      exception.stack,
    );

    // Create the error response
    const errorResponse = {
      success: false,
      statusCode: status,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      ...(errorDetails && { details: errorDetails }),
    };

    response.status(status).json(errorResponse);
  }
}
