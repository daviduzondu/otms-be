import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { FirebaseService } from './firebase.service';

const firebaseProvider = {
  provide: 'FIREBASE_SERVICE',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    // console.log(configService.get<string>('PRIVATE_KEY').replace(/\\n/gm, "\n"))
    const firebaseConfig = {
      type: configService.get<string>('TYPE'),
      projectId: configService.get<string>('PROJECT_ID'),
      privateKeyId: configService.get<string>('PRIVATE_KEY_ID'),
      clientEmail: configService.get<string>('CLIENT_EMAIL'),
      privateKey: configService.get<string>('PRIVATE_KEY').replace(/\\n/gm, '\n'),

      // client_id: configService.get<string>('CLIENT_ID'),
      // auth_uri: configService.get<string>('AUTH_URI'),
      // token_uri: configService.get<string>('TOKEN_URI'),
      // auth_provider_x509_cert_url: configService.get<string>('AUTH_CERT_URL'),
      // client_x509_cert_url: configService.get<string>('CLIENT_CERT_URL'),
      // universe_domain: configService.get<string>('UNIVERSAL_DOMAIN'),
    } as admin.ServiceAccount;

    return admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
      storageBucket: `fire-otms.firebasestorage.app`,
    });
  },
};

@Global()
@Module({
  imports: [ConfigModule],
  providers: [firebaseProvider, FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
