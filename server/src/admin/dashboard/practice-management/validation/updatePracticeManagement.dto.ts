import {
  IsAlpha,
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
} from 'class-validator';
import moment from 'moment';

export default class UpdatePracticeManagementDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'city should only contain letters and spaces',
  })
  city: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  location: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  managementRegion: string;

  @IsOptional()
  @MinDate(moment().subtract(100, 'years').startOf('day').toDate())
  @MaxDate(moment().startOf('day').toDate())
  openDate: Date;

  @IsOptional()
  @IsNotEmpty()
  @IsNumberString()
  @MinLength(10)
  @MaxLength(10)
  phone: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  region: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  regionalManager: string;

  @IsOptional()
  @IsNotEmpty()
  @IsAlpha()
  @Length(2, 2)
  stateCode: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumberString()
  @Length(5, 5)
  zip: string;

  @IsPositive()
  annualRevenue: number;

}
