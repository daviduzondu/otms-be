import { IsDateString, IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  middleName: string;

  @IsString()
  lastName: string;

  @IsString()
  regNumber: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsDateString()
  removeAfter: Date;

  @IsOptional()
  @IsUUID()
  classId: string;
}

export class AddStudentToClassDto {
  @IsString()
  studentId: string;

  @IsString()
  classId: string;

  @IsDateString()
  removeAfter: Date;
}
