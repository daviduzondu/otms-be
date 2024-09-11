import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Global()
@Module({
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
