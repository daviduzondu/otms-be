import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './interceptors/global.interceptor';
import { config } from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { detect } from 'detect-port';
config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api', { exclude: ['/', 'api'] });
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      enableDebugMessages: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  if (process.env.EMAIL_MODE === 'local') {
    detect(Number(process.env.MAILPIT_PORT))
      .then((realPort) => {
        if (Number(process.env.MAILPIT_PORT) == realPort) {
          console.log(`Mailpit is not running or not detected on port ${process.env.MAILPIT_PORT}. 
          Start your mailpit server using the following command:
          mailpit --database /path/to/database.db`);
          throw new Error('Failed to detect Mailpit');
        }
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
