import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsObject,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

enum PhoneTypeEnum {
  MOBILE = 'mobile',
  HOME = 'home',
  OFFICE = 'office',
}

export class PhonesDto {
  @IsNotEmpty()
  @IsNumberString()
  @MinLength(10)
  @MaxLength(10)
  phone: string;

  @IsNotEmpty()
  @IsEnum(PhoneTypeEnum, {
    message: "'type' should be 'mobile', 'home' or 'office'",
  })
  type: 'mobile' | 'home' | 'office';
}

export class UpdatePasswordAndPhonesDto {
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PhonesDto)
  phones: PhonesDto[];

  @IsNotEmpty()
  @Matches(/^(?=.*?[a-zA-Z])(?=.*?[0-9]).{8,}$/, {
    message:
      'password should be at least 8 characters long and should have at least 1 number',
  })
  password: string;
}
export class ListDto {
   zipcode: string
   radius: number
}

export class SetZipcodeAndRadiusDto {
  /*ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PhonesDto)
  phones: PhonesDto[];

  @IsNotEmpty()
  @Matches(/^(?=.*?[a-zA-Z])(?=.*?[0-9]).{8,}$/, {
    message:
      'password should be at least 8 characters long and should have at least 1 number',
  })
  password: string; */
  @IsObject()
  @ValidateNested()
  readonly zipcodeAndRadius: ListDto[]
  userId: string
}