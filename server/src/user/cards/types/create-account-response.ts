import { ApiProperty } from '@nestjs/swagger';

class AccountResponseData {
  @ApiProperty()
  pmt_ref_no: string;

  @ApiProperty()
  product_id: string;

  @ApiProperty()
  galileo_account_number: string;

  @ApiProperty()
  cip: string;

  @ApiProperty()
  card_id: string;

  @ApiProperty()
  card_number: string;

  @ApiProperty()
  expiry_date: string;

  @ApiProperty()
  card_security_code: string;

  @ApiProperty()
  emboss_line_2: string;
}

export class Echo {
  @ApiProperty()
  transaction_id: string;

  @ApiProperty()
  provider_transaction_id: string;

  @ApiProperty()
  provider_timestamp: Date;
}

export class CreateAccountResponse {
  @ApiProperty()
  status_code: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  system_timestamp: Date;

  @ApiProperty({ type: [AccountResponseData] })
  response_data: AccountResponseData[];

  @ApiProperty()
  processing_time: number;

  @ApiProperty()
  rtoken: string;

  @ApiProperty({ type: Echo })
  echo: Echo;
}
