import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import moment from 'moment';

import UpdatePracticeManagementDto from './updatePracticeManagement.dto';

@Injectable()
export class UpdatePracticeManagementPipe implements PipeTransform<any> {
  async transform(
    requestBody: UpdatePracticeManagementDto,
    { metatype }: ArgumentMetadata,
  ) {
    if (requestBody.address && typeof requestBody.address === 'string') {
      requestBody.address = requestBody.address.trim();
    }
    if (requestBody.city && typeof requestBody.city === 'string') {
      requestBody.city = requestBody.city.trim();
    }
    if (requestBody.location && typeof requestBody.location === 'string') {
      requestBody.location = requestBody.location.trim();
    }
    if (
      requestBody.managementRegion &&
      typeof requestBody.managementRegion === 'string'
    ) {
      requestBody.managementRegion = requestBody.managementRegion.trim();
    }
    if (requestBody.openDate) {
      requestBody.openDate = moment(requestBody.openDate)
        .startOf('day')
        .toDate();
    }
    if (requestBody.phone && typeof requestBody.phone === 'string') {
      requestBody.phone = requestBody.phone.trim();
    }
    if (requestBody.region && typeof requestBody.region === 'string') {
      requestBody.region = requestBody.region.trim();
    }
    if (
      requestBody.regionalManager &&
      typeof requestBody.regionalManager === 'string'
    ) {
      requestBody.regionalManager = requestBody.regionalManager.trim();
    }
    if (requestBody.stateCode && typeof requestBody.stateCode === 'string') {
      requestBody.stateCode = requestBody.stateCode.trim();
    }
    if (requestBody.zip && typeof requestBody.zip === 'string') {
      requestBody.zip = requestBody.zip.trim();
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
