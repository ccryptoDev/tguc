import {
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class GenerateEFTADto {
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  applicationReference: string;

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(4)
  cardCode: string;

  @IsNotEmpty()
  @IsString()
  cardHolder: string;

  @IsNotEmpty()
  @IsString()
  cardIssuer: string;

  @IsNotEmpty()
  @MinLength(15)
  @MaxLength(16)
  cardNumber: string;

  @IsNotEmpty()
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'city should only contain letters and spaces',
  })
  city: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(2)
  expirationMonth: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(2)
  expirationYear: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(10)
  phoneNumber: string;

  selectedOffer: Record<string, any>;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(2)
  selectedState: string;

  @IsNotEmpty()
  @IsString()
  signature: string;

  @IsNotEmpty()
  @IsString()
  street: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(5, 5)
  zipCode: string;
}
