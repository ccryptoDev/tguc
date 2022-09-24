import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsAlpha,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Matches,
  MaxDate,
  MaxLength,
  MinDate,
  MinLength,
  ValidateIf,
  ValidateNested,
  IsDate,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import moment from 'moment';

enum SourceEnum {
  LEAD_LIST = 'lead-list',
  WEB = 'web',
}

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

export class ContractorApplyDto {
  // @IsNotEmpty()
  // @IsPositive()
  // annualIncome: number;

  @MinDate(moment().subtract(100, 'years').startOf('day').toDate())
  @MaxDate(moment().subtract(18, 'years').startOf('day').toDate())
  @IsDate()
  dateOfBirth: Date;

  // @IsOptional()
  // @IsString()
  // driversLicenseNumber: string;

  // @ValidateIf((o) => o.driversLicenseNumber)
  // @IsString()
  // driversLicenseState: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsAlpha()
  firstName: string;

  // @IsOptional()
  // @IsBoolean()
  // isBackendApplication: boolean;

  @IsNotEmpty()
  @IsAlpha()
  lastName: string;

  @IsOptional()
  @IsString()
  middleName: string;

  @IsNotEmpty()
  @Matches(/^(?=.*?[a-zA-Z])(?=.*?[0-9]).{8,}$/, {
    message:
      'password should be at least 8 characters long and should have at least 1 number',
  })
  password: string;

  @ArrayNotEmpty()
  @Type(() => PhonesDto)
  phones: PhonesDto[];

  @IsOptional()
  @IsNotEmpty()
  @IsUUID('4')
  practiceManagement: string;

  // @IsNotEmpty()
  // @IsPositive()
  // requestedAmount: number;

  @IsNotEmpty()
  @IsEnum(SourceEnum, {
    message: "source should be either 'lead-list' or 'web'",
  })
  source: 'lead-list' | 'web';

  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  @Length(4, 4)
  ssnNumber: string;

  @IsNotEmpty()
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'city should only contain letters and spaces',
  })
  city: string;

  @IsNotEmpty()
  @IsAlpha()
  @Length(2, 2)
  state: string;

  @IsNotEmpty()
  @IsString()
  street: string;

  @IsOptional()
  @IsString()
  unitApt: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(5, 5)
  zipCode: string;

  @IsOptional()
  @IsString()
  referredBy?: string;
}
