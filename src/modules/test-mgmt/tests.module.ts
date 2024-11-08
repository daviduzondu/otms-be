import { Module } from '@nestjs/common';
import { TestsController } from './tests.controller';
import { TestService } from './tests.service';

@Module({
  controllers: [TestsController],
  providers: [TestService]
})
export class TestsModule {}
