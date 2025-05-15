import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from '../interfaces/response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    // Get the exception response
    const exceptionResponse = exception.getResponse();

    // Extract the error message
    let errorMessage: string = exception.message;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as any;

      if (responseObj.message) {
        if (Array.isArray(responseObj.message)) {
          // For validation errors that return an array of messages
          errorMessage = responseObj.message[0];
        } else if (typeof responseObj.message === 'string') {
          errorMessage = responseObj.message;
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
}
