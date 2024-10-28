import { IsEmail, IsString } from 'class-validator';

export class LocalUserLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
