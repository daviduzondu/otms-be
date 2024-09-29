import { Exclude } from 'class-transformer';

export class BaseDto {
  @Exclude()
  createdAt: string;

  @Exclude()
  updatedAt: string;
}
