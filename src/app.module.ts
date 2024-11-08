import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import * as Joi from 'joi';
import { AuthService } from './modules/auth/auth.service';
import { UsersModule } from './modules/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { KyseslyModule } from './modules/kysesly/kysesly.module';
import { TestsModule } from './modules/test-mgmt/tests.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { EmailModule } from './modules/email/email.module';
import { EmailService } from './modules/email/email.service';
import { ClassesModule } from './modules/classes/classes.module';

@Module({
  imports: [
    PassportModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
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
    ClassesModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthService, EmailService],
})
export class AppModule {}
