import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class GetAllLogActivitiesPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!value.page) {
      value.page = 1;
    } else {
      value.page = +value.page;
    }
    if (!value.perPage) {
      value.perPage = 25;
    } else {
      value.perPage = +value.perPage;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object, {
      forbidUnknownValues: true,
      validationError: { target: false, value: true },
    });
    if (errors.length > 0) {
      throw new BadRequestException(errors, 'Invalid data');
    }

    return value;
  }
}
