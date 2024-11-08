import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BREVO_INSTANCE } from '../../constants/tokens';
import { SendSmtpEmail, TransactionalEmailsApi } from '@getbrevo/brevo';
import * as mjml from 'mjml';
import * as handlebars from 'handlebars';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { CustomException } from '../../exceptions/custom.exception';

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

  async sendEmail(payload: { to: Array<{ email: string; name: string }>; context: Record<string, any>; subject: string; templateName: string }) {
    const template = fs.readFileSync(path.join(process.cwd(), 'src', 'email', `/templates/${payload.templateName}.mjml`), { encoding: 'utf8' });

    const html = this.compileTemplate(template, payload.context);

    const sendSmtpEmail = new SendSmtpEmail();

    sendSmtpEmail.to = payload.to;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.subject = payload.subject;
    sendSmtpEmail.sender = this.sender;

    await this.brevoInstance.sendTransacEmail(sendSmtpEmail).catch((err) => {
      console.log(err);
      throw new CustomException('Failed to send email', HttpStatus.BAD_REQUEST);
    });

    return {
      message: 'Email sent successfully',
    };
  }
}
