import {
  IsUUID,
  IsNumber,
  ValidateNested,
  ArrayNotEmpty,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class ItemDto {
  @IsUUID()
  id: string;

  @IsNumber()
  index: number;

  @IsUUID()
  testId: string;
}

export class UpdateQuestionOrderDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  questions: ItemDto[];
}
