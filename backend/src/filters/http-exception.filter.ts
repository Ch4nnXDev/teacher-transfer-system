import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ErrorResponse,
  ExceptionResponseObject,
} from '../interfaces/response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    // Get the exception response
    const exceptionResponse = exception.getResponse();

    // Extract the error message with proper type checking
    let errorMessage: string = exception.message;

    // Type guard to check if response is an object
    if (this.isExceptionResponseObject(exceptionResponse)) {
      if (exceptionResponse.message) {
        if (Array.isArray(exceptionResponse.message)) {
          // For validation errors that return an array of messages
          errorMessage = exceptionResponse.message[0];
        } else if (typeof exceptionResponse.message === 'string') {
          errorMessage = exceptionResponse.message;
        }
      }
    }

    // Create clean error response without duplication
    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Operation failed',
      timestamp: new Date().toISOString(),
      error: errorMessage,
      statusCode: status,
    };

    response.status(status).json(errorResponse);
  }

  // Type guard to check if the exception response is an object with expected properties
  private isExceptionResponseObject(
    response: unknown,
  ): response is ExceptionResponseObject {
    return (
      typeof response === 'object' && response !== null && 'message' in response
    );
  }
}
