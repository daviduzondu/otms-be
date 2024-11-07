import { Module } from '@nestjs/common';
import * as brevo from '@getbrevo/brevo';
import { ConfigService } from '@nestjs/config';
import { BREVO_INSTANCE } from '../constants/tokens';

@Module({
  providers: [
    {
      provide: BREVO_INSTANCE,
      useFactory: () => {
        const brevoInstance = new brevo.TransactionalEmailsApi();
        //@ts-expect-error I think this is an issue from Brevo's side
        const apiKey = brevoInstance.authentications['apiKey'];
        apiKey.apiKey = new ConfigService().get('BREVO_API_KEY');
        return brevoInstance;
      },
    },
  ],
  exports: [BREVO_INSTANCE],
})
export class EmailModule {}
