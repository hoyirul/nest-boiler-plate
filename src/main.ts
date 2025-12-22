import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LangInterceptor } from '@/shared/interceptors/lang.interceptor';
import { AppExceptionFilter } from '@/shared/filters/app-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { env } from '@/core/config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix('api');
  
  app.useGlobalInterceptors(new LangInterceptor());
  app.useGlobalFilters(new AppExceptionFilter());

  await app.listen(env.APP_PORT ?? 3000);
}
bootstrap();
