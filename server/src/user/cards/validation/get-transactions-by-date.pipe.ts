import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import moment from 'moment';

import { GetTransactionsByDateDto } from './get-transactions-by-date.dto';

@Injectable()
export class GetTransactionsByDatePipe implements PipeTransform<any> {
  async transform(
    requestBody: GetTransactionsByDateDto,
    { metatype }: ArgumentMetadata,
  ) {
    if (requestBody.startDate) {
      requestBody.startDate = moment(requestBody.startDate)
        .startOf('day')
        .toDate();
    }

    if (requestBody.endDate) {
      requestBody.endDate = moment(requestBody.endDate).endOf('day').toDate();
    }

    const object = plainToClass(metatype, requestBody);
    const errors = await validate(object, {
      forbidUnknownValues: true,
      validationError: { target: false, value: true },
    });
    if (errors.length > 0) {
      throw new BadRequestException(errors, 'Invalid data');
    }

    return requestBody;
  }
}
