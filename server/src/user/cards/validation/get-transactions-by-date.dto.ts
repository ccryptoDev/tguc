import { IsDate, ValidationArguments } from 'class-validator';

import moment from 'moment';

export class GetTransactionsByDateDto {
  @IsDate()
  startDate: Date;

  @IsDate({
    message: (args: ValidationArguments) => {
      if (moment(args.value).isBefore(args.object['startDate'])) {
        return 'endDate cannot be before startDate';
      }
    },
  })
  endDate: Date;
}
