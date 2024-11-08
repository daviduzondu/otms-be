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
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  private async hashPassword(password: string) {
    return await bcrypt.hash(password, await bcrypt.genSalt());
  }

  async registerUserWithEmailAndPassword(
    CreateLocalUserDto: CreateLocalUserDto,
  ) {
    const exists = await this.userService.getUserRecord({
      email: CreateLocalUserDto.email,
    });

    if (exists)
      throw new CustomException('User already exists', HttpStatus.CONFLICT);

    const user = await this.db
      .insertInto('users')
      .values(
        Object.assign(CreateLocalUserDto, {
          password: await this.hashPassword(CreateLocalUserDto.password),
        }),
      )
      .returningAll()
      .executeTakeFirst();
    return {
      message: 'Registration Successful',
      data: { email: user.email },
    };
  }

  async login(LocalUserLoginDto: LocalUserLoginDto) {
    const user = await this.userService.getUserRecord({
      email: LocalUserLoginDto.email,
    });
    if (
      !user ||
      !bcrypt.compareSync(LocalUserLoginDto.password, user.password)
    ) {
      throw new CustomException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return {
      message: 'Login Successful',
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      photoUrl: user.photoId,
      accessToken: this.jwtService.sign(
        Object.assign(user, { passport: undefined }),
      ),
    };
  }
}
