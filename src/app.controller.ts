import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EmailService } from './email/email.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  async getHello() {
    return this.appService.getHello();
  }

  // @Get('send-mail')
  // async sendMail() {
  //   return await this.emailService.sendEmail({
  //     to: [{ email: 'davidclement216@gmail.com', name: 'David Uzondu' }],
  //     subject: 'Hello!',
  //     templateName: 'test-invitation',
  //     context: {
  //       studentName: 'John Doe',
  //       teacherName: 'Ms. Smith',
  //       testName: 'Math Test - Chapter 1',
  //       testUrl: 'https://example.com/test-link',
  //     },
  //   });
  // }
}
