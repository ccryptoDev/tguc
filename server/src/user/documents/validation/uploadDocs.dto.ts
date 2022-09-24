import { IsBase64, IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';

enum documentTypeEnum {
  DRIVERS_LICENSE = 'drivers license',
  PASSPORT = 'passport',
  INSURANCE = 'insurance',
  STATE_BUSINESS_LICENSE = 'state business license',
  CONTRACTOR_LICENSE = 'contractor license',
  W9 = 'w9',
  WORK_ORDER = 'work order',
}

export default class UploadDocsDto {
  // Extracted from JWT
  userId: string;
  screenTrackingId: string;

  // @IsNotEmpty()
  // @IsEnum(documentTypeEnum, {
  //   message: "'documentType' should be either 'drivers license' or 'passport'",
  // })
  // documentType: documentTypeEnum;

  // @ValidateIf((o) => o.documentType === 'drivers license')
  // @IsNotEmpty()
  // @IsBase64()
  // driversLicenseFront: string;

  // @ValidateIf((o) => o.documentType === 'drivers license')
  // @IsNotEmpty()
  // @IsBase64()
  // driversLicenseBack: string;

  @IsNotEmpty()
  document: any[];
}
