import {
  Equals,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import applicationLinkConfig from '../link.config';

enum SourceEnum {
  LEAD_LIST = 'lead-list',
  WEB = 'web',
}
const apiToken: string = applicationLinkConfig().apiToken;
export class CreateLinkDto {
  @ValidateIf((o) => o.source === 'lead-list')
  @IsNotEmpty()
  @Equals(apiToken, { message: 'Invalid API token' })
  apiToken: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsBoolean()
  isBackendApplication: boolean;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ValidateIf((o) => o.source === 'lead-list')
  @IsNotEmpty()
  @IsString()
  leadId: string;

  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  @MinLength(10)
  @MaxLength(10)
  phone: string;

  @IsNotEmpty()
  @IsUUID('4')
  practiceManagement: string;

  @IsOptional()
  @IsBoolean()
  sendEmail: boolean;

  @IsOptional()
  @IsBoolean()
  sendSms: boolean;

  @IsNotEmpty()
  @IsEnum(SourceEnum, {
    message: "'source' should be either 'lead-list' or 'web'",
  })
  source: 'lead-list' | 'web';
}
