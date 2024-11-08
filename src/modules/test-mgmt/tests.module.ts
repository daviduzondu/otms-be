import { Module } from '@nestjs/common';
import { TestsController } from './tests.controller';
import { TestService } from './tests.service';
import { EmailService } from '../email/email.service';

@Module({
  controllers: [TestsController],
  providers: [TestService, EmailService],
})
export class TestsModule {}
