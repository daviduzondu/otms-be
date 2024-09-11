import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUserWithEmailAndPassword(@Body() credentials) {
    return await this.authService.registerUserWithEmailAndPassword(credentials);
  }
}
