import {
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
export class CreateVerticalDto {
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  name: string[];
}
