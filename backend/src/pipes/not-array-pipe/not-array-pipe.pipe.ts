import { Injectable, PipeTransform } from '@nestjs/common';
import { ArrayInputException } from 'src/exceptions/validation.exceptions';

@Injectable()
export class NotArrayPipePipe implements PipeTransform {
  transform<T>(value: T): T {
    if (Array.isArray(value)) {
      throw new ArrayInputException();
    }
    return value;
  }
}
