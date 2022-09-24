import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';

export class ValidateSourcePipe implements PipeTransform {
  readonly allowedSources: string[] = ['web', 'leadlist'];
  transform(status: string, metadata: ArgumentMetadata): any {
    if (this.allowedSources.includes(status)) {
      return status;
    } else {
      throw new BadRequestException(
        `Source may` +
          ` only be one of the following: [${this.allowedSources.join(', ')}]` +
          ` but was: ${status}`,
      );
    }
  }
}
