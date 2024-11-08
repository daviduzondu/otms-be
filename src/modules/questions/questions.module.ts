import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { TestService } from '../test-mgmt/tests.service';

@Module({
  controllers: [QuestionsController],
  providers: [QuestionsService, TestService],
})
export class QuestionsModule {}
