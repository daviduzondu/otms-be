import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ClassService } from '../class/class.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ClassService],
  exports: [UsersService],
})
export class UsersModule {}
