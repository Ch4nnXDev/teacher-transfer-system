import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class NotArrayPipePipe implements PipeTransform {
  transform<T>(value: T): T {
    if (Array.isArray(value)) {
      throw new BadRequestException('Array input is not allowed');
    }
    return value;
  }
}
