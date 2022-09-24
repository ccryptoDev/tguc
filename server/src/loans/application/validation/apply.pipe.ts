import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import moment from 'moment';

import { ApplyDto } from './apply.dto';

@Injectable()
export class ApplyPipe implements PipeTransform<any> {
  async transform(requestBody: ApplyDto, { metatype }: ArgumentMetadata) {
    // if (requestBody.city && typeof requestBody.city === 'string') {
    //   requestBody.city = requestBody.city.trim();
    // }
    if (requestBody.dateOfBirth) {
      requestBody.dateOfBirth = moment(requestBody.dateOfBirth)
        .startOf('day')
        .toDate();
    }
    // if (
    //   requestBody.driversLicenseNumber &&
    //   typeof requestBody.driversLicenseNumber === 'string'
    // ) {
    //   requestBody.driversLicenseNumber =
    //     requestBody.driversLicenseNumber.trim();
    // }
    // if (
    //   requestBody.driversLicenseState &&
    //   typeof requestBody.driversLicenseState === 'string'
    // ) {
    //   requestBody.driversLicenseState = requestBody.driversLicenseState.trim();
    // }
    if (requestBody.email && typeof requestBody.email === 'string') {
      requestBody.email = requestBody.email.trim();
    }
    if (requestBody.firstName && typeof requestBody.firstName === 'string') {
      requestBody.firstName = requestBody.firstName.trim();
    }
    // if (requestBody.middleName && typeof requestBody.middleName === 'string') {
    //   requestBody.middleName = requestBody.middleName.trim();
    // }
    if (requestBody.lastName && typeof requestBody.lastName === 'string') {
      requestBody.lastName = requestBody.lastName.trim();
    }
    if (requestBody.ssnNumber && typeof requestBody.ssnNumber === 'string') {
      requestBody.ssnNumber = requestBody.ssnNumber.trim();
    }
    // if (requestBody.state && typeof requestBody.state === 'string') {
    //   requestBody.state = requestBody.state.trim().toUpperCase();
    // }
    // if (requestBody.street && typeof requestBody.street === 'string') {
    //   requestBody.street = requestBody.street.trim();
    // }
    // if (requestBody.unitApt && typeof requestBody.unitApt === 'string') {
    //   requestBody.unitApt = requestBody.unitApt.trim();
    // }
    // if (requestBody.zipCode && typeof requestBody.zipCode === 'string') {
    //   requestBody.zipCode = requestBody.zipCode.trim();
    // }

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
