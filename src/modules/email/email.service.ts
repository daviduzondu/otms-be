import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BREVO_INSTANCE } from '../../constants/tokens';
import { SendSmtpEmail, TransactionalEmailsApi } from '@getbrevo/brevo';
import mjml from 'mjml';
import handlebars from 'handlebars';
import fs from 'node:fs';
import path from 'node:path';
import { CustomException } from '../../exceptions/custom.exception';
import { setTimeout } from 'node:timers/promises';

@Injectable()
export class EmailService {
  private sender = { name: 'Online Test Management System', email: 'no-reply@otms.ng' };

  constructor(
    private readonly configService: ConfigService,
    @Inject(BREVO_INSTANCE)
    private readonly brevoInstance: TransactionalEmailsApi,
  ) {
    handlebars.registerHelper('required', function (variable) {
      if (variable === undefined || variable === null) {
        throw new Error(`Missing required variable`);
      }
      return variable;
    });
  }

  private compileTemplate(template: string, data: Record<string, any>): string {
    const hbsTemplate = handlebars.compile(template);
    const mjmlOutput = hbsTemplate(data);

    const { html, errors } = mjml(mjmlOutput);
    if (errors.length > 0) {
      throw new Error('Error compiling MJML template');
    }
    return html;
  }

  async sendMailPit(data) {
    try {
      const response = await fetch('http://localhost:8025/api/v1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      await response.json();
    } catch (error) {}
    return;
  }

  async sendEmail(payload: { to: Array<{ email: string; name: string }>; context: any; subject: string; templateName: string }) {
    const template = fs.readFileSync(path.join(process.cwd(), 'src', 'modules', 'email', `/templates/${payload.templateName}.mjml`), { encoding: 'utf8' });

    const sendSmtpEmail = new SendSmtpEmail();

    sendSmtpEmail.subject = payload.subject;
    sendSmtpEmail.sender = this.sender;
    sendSmtpEmail.htmlContent = '<div></div>';
    sendSmtpEmail.messageVersions = payload.to.map((x) => ({
      to: [
        {
          email: x.email,
          name: payload.context.filter(({ email }) => email === x.email)[0].studentName,
        },
      ],
      htmlContent: this.compileTemplate(template, payload.context.filter(({ email }) => email === x.email)[0]),
    }));

    if (this.configService.get('EMAIL_MODE') === 'local') {
      await setTimeout(1200);
      sendSmtpEmail.messageVersions.forEach(async (x) => {
        await this.sendMailPit({ subject: sendSmtpEmail.subject, html: x.htmlContent, to: x.to, from: this.sender, tags: [x.to[0].name] });
      });
    }

    await this.brevoInstance.sendTransacEmail(sendSmtpEmail).catch((err) => {
      console.log(err);
      if (this.configService.get('EMAIL_MODE') === 'prod') throw new CustomException('Failed to send email', HttpStatus.BAD_REQUEST);
    });

    return {
      message: 'Email sent successfully',
    };
  }
}
