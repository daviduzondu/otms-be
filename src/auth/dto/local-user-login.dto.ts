import { IsEmail, IsStrongPassword } from 'class-validator';

export class LocalUserLoginDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;
}
