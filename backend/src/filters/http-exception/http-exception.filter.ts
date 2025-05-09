import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from 'src/interfaces/response/response.interface';

interface ExceptionResponseObject {
  message: string | string[];
  statusCode?: number;
  error?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    // Type cast with specific interface
    const exceptionResponse =
      exception.getResponse() as ExceptionResponseObject;

    // Extract the error message
    let errorMessage: string = exception.message;
    if (typeof exceptionResponse === 'object' && exceptionResponse.message) {
      if (Array.isArray(exceptionResponse.message)) {
        // For validation errors that return an array of messages
        errorMessage = exceptionResponse.message[0];
      } else if (typeof exceptionResponse.message === 'string') {
        errorMessage = exceptionResponse.message;
      }
    }

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
