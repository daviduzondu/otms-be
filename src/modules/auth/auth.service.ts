import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectKysesly } from '../kysesly/decorators/inject-repository';
import { Database } from '../kysesly/database';
import * as bcrypt from 'bcrypt';
import { CreateLocalUserDto } from './dto/create-local-user.dto';
import { UsersService } from '../users/users.service';
import { CustomException } from '../../exceptions/custom.exception';
import { LocalUserLoginDto } from './dto/local-user-login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectKysesly() private db: Database,
    private teacherService: UsersService,
    private jwtService: JwtService,
  ) {}

  private async hashPassword(password: string) {
    return await bcrypt.hash(password, await bcrypt.genSalt());
  }

  async registerUserWithEmailAndPassword(CreateLocalUserDto: CreateLocalUserDto) {
    const exists = await this.teacherService.getTeacherRecord({
      email: CreateLocalUserDto.email,
    });

    if (exists) throw new CustomException('User already exists', HttpStatus.CONFLICT);

    const teacher = await this.db
      .insertInto('teachers')
      .values(
        Object.assign(CreateLocalUserDto, {
          password: await this.hashPassword(CreateLocalUserDto.password),
        }),
      )
      .returningAll()
      .executeTakeFirst();
    return {
      message: 'Registration Successful',
      data: { email: teacher.email },
    };
  }

  async login(LocalUserLoginDto: LocalUserLoginDto) {
    const teacher = await this.teacherService.getTeacherRecord({
      email: LocalUserLoginDto.email,
    });
    if (!teacher || !bcrypt.compareSync(LocalUserLoginDto.password, teacher.password)) {
      throw new CustomException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return {
      message: 'Login Successful',
      id: teacher.id,
      email: teacher.email,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      photoUrl: teacher.photoId,
      // tokenExpiry: this.jwtService.decode()
      accessToken: this.jwtService.sign(Object.assign(teacher, { passport: undefined })),
    };
  }
}
