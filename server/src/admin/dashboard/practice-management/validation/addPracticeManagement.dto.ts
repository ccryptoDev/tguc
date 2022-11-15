import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsAlpha,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export default class AddPracticeManagementDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value.trim())
  @Length(1, 50)
  address: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value.trim())
  @Length(1, 30)
  city: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value.trim())
  @Length(1, 50)
  contactName: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value.trim())
  @Length(1, 50)
  email: string;

  @IsOptional()
  @IsUUID(4)
  @Transform(({ value }: TransformFnParams) => value.trim())
  id?: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value.trim())
  @Length(1, 30)
  location: string;

  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ value }: TransformFnParams) => value.trim())
  @MinLength(10)
  @MaxLength(10)
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value.trim())
  @Length(1, 30)
  practiceName: string;

  @IsNotEmpty()
  @IsAlpha()
  @Transform(({ value }: TransformFnParams) => value.trim())
  @Length(2, 2)
  stateCode: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value.trim())
  @Length(1, 30)
  url: string;

  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ value }: TransformFnParams) => value.trim())
  @Length(5, 5)
  zip: string;

  @IsPositive()
  annualRevenue: number;
}
