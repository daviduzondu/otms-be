import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateLocalUserDto } from './dto/create-local-user.dto';
import { LocalUserLoginDto } from './dto/local-user-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUserWithEmailAndPassword(@Body() payload: CreateLocalUserDto) {
    return this.authService.registerUserWithEmailAndPassword(payload);
  }

  @Post('login')
  async LoginLocalUser(@Body() payload: LocalUserLoginDto) {
    return this.authService.login(payload);
  }

  @Get('generate-token')
  async GenerateToken() {}
}
