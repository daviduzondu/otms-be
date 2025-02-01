import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import * as Joi from 'joi';
import * as path from 'path';
import { AuthService } from './modules/auth/auth.service';
import { UsersModule } from './modules/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { KyseslyModule } from './modules/kysesly/kysesly.module';
import { TestsModule } from './modules/test-mgmt/tests.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { EmailModule } from './modules/email/email.module';
import { EmailService } from './modules/email/email.service';
import { ClassModule } from './modules/./class/class.module';
import { StorageService } from './modules/storage/storage.service';
import { StorageModule } from './modules/storage/storage.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as process from 'node:process';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { BrandingModule } from './modules/branding/branding.module';

@Module({
  imports: [
    PassportModule,
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        PORT: Joi.number().required(),
        BREVO_API_KEY: Joi.string().required(),
        FRONTEND_BASE_URL: Joi.string().required(),
        STORAGE_MODE: Joi.string().valid('remote', 'local').required(),
        EMAIL_MODE: Joi.string().valid('local', 'prod').required(),

        // Conditional validation for production environment
      }).when(Joi.object({ STORAGE_MODE: Joi.string().valid('remote') }).unknown(), {
        then: Joi.object({
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
    }),
    JwtModule.register({
      global: true,
      secret: new ConfigService().get('JWT_SECRET'),
      signOptions: { expiresIn: '30d' },
    }),
    AuthModule,
    UsersModule,
    KyseslyModule,
    TestsModule,
    QuestionsModule,
    EmailModule,
    ClassModule,
    StorageModule,
    FirebaseModule,
    AnalyticsModule,
    BrandingModule,
  ],
  controllers: [AppController],

  providers: [AppService, AuthService, EmailService, StorageService],
})
export class AppModule {}
