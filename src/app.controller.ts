import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EmailService } from './modules/email/email.service';

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

  @Get('server-time')
  getServerTime() {
    return new Date().toISOString();
  }

  // @Get('send-mail')
  // async sendMail() {
  //   return await this.emailService.sendEmail({
  //     to: [{ email: 'daviduzondu@duck.com', name: 'David Uzondu' }],
  //     subject: 'You have been invited to take a test!',
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
