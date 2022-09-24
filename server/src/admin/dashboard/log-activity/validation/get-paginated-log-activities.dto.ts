import { Transform, TransformFnParams } from 'class-transformer';
import { IsOptional, IsPositive, IsString } from 'class-validator';

export default class GetPaginatedLogActivitiesDto {
  @IsPositive()
  page: number;

  @IsPositive()
  perPage: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value.trim())
  search: string;
}
