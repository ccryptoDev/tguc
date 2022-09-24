import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import moment from 'moment';

export class ValidateObjectIdPipe implements PipeTransform {
  transform(objectId: string, metadata: ArgumentMetadata): any {
    const valid = objectId;
    if (!valid)
      throw new BadRequestException(`${objectId} is not a valid ObjectID`);

    return objectId;
  }
}
