import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import moment from 'moment';

export class ValidateApproveDatePipe implements PipeTransform {
  transform(date: string, metadata: ArgumentMetadata): any {
    const dateHaveBeenPassed = date != undefined;
    if (!dateHaveBeenPassed) return undefined;

    const isISOdate = moment(date, moment.ISO_8601).isValid();
    if (!isISOdate)
      throw new BadRequestException(
        `procedureStartDate date must be a valid ISO date string`,
      );

    const approveDate = moment(date);
    const now = moment();
    const differenceDays = moment.duration(now.diff(approveDate)).asDays();

    if (moment(approveDate).isAfter(now) && differenceDays > 90) {
      throw new BadRequestException(
        `procedureStartDate can not be set later than 90 days from now, yet you are setting it to ${differenceDays} days`,
      );
    } else if (moment(approveDate).isBefore(now) && differenceDays > 14) {
      throw new BadRequestException(
        `procedureStartDate can not be set earlier than 14 days before now, yet you are setting it to ${differenceDays} days`,
      );
    }

    return approveDate;
  }
}
