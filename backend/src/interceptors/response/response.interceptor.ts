import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { BaseResponse } from '../../interfaces/response.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, BaseResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<BaseResponse<T>> {
    return next.handle().pipe(
      map((data: T) => {
        const response = context.switchToHttp().getResponse<Response>();
        const statusCode: number = response.statusCode || HttpStatus.OK;

        return {
          success: true,
          message: this.getSuccessMessageFromStatusCode(statusCode),
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private getSuccessMessageFromStatusCode(statusCode: number): string {
    switch (statusCode as HttpStatus) {
      case HttpStatus.OK:
        return 'Request successful';
      case HttpStatus.CREATED:
        return 'Resource created successfully';
      case HttpStatus.NO_CONTENT:
        return 'Resource deleted successfully';
      default:
        return 'Operation successful';
    }
  }
}
