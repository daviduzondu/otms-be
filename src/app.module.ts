import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from './drizzle/drizzle.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import * as Joi from 'joi';
import { FirebaseModule } from './firebase/firebase.module';
import { APP_GUARD } from '@nestjs/core';
import { SyncGuard } from './guards/sync.guard';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    FirebaseModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: ['.env', '.env.development'],
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        TYPE: Joi.string().required(),
        PROJECT_ID: Joi.string().required(),
        PRIVATE_KEY_ID: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        CLIENT_EMAIL: Joi.string().required(),
        CLIENT_ID: Joi.string().required(),
        AUTH_URI: Joi.string().required(),
        TOKEN_URI: Joi.string().required(),
        AUTH_PROVIDER_X509_CERT_URL: Joi.string().required(),
        CLIENT_X509_CERT_URL: Joi.string().required(),
        UNIVERSE_DOMAIN: Joi.string().required(),
      }),
    }),
    DrizzleModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: SyncGuard,
    },
  ],
})
export class AppModule {}
