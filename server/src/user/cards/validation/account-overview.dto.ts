import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsNumberString, MaxDate, MinDate } from 'class-validator';
import moment from 'moment';

export class AccountOverViewDto {
  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ value }: TransformFnParams) => value.trim())
  accountNumber: string;

  @MinDate(moment().subtract(3, 'months').startOf('day').toDate())
  @MaxDate(moment().endOf('day').toDate())
  from: Date;

  @MinDate(moment().subtract(3, 'months').startOf('day').toDate())
  @MaxDate(moment().endOf('day').toDate())
  to: Date;
}
