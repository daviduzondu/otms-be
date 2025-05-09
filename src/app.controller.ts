import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { EmailService } from './modules/email/email.service';
import { Request, Response } from 'express';

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

  @Post('webhook')
  async distributeWebhook(@Body() payload, @Res() res: Response, @Req() req: Request) {
    const wh1 = process.env.WH1;
    const wh2 = process.env.WH2;
    const wh3 = process.env.WH3;

    const webhookUrls = [wh1, wh2, wh3].filter(Boolean);

    try {
      fetch(webhookUrls[0], {
        method: 'POST',
        headers: {
          ...Object.fromEntries(Object.entries(req.headers).filter(([key, value]) => typeof value === 'string')),
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(payload),
      }),
        res.status(200).json({ message: 'Webhook distributed successfully' });
    } catch (error) {
      console.error('Error distributing webhook:', error);
      res.status(500).json({ error: 'Failed to distribute webhook' });
    }
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
