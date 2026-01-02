import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LangInterceptor } from '@/shared/interceptors/lang.interceptor';
import { AppExceptionFilter } from '@/shared/filters/app-exception.filter';
import helmet from 'helmet';
import { corsOrigins, env } from '@/core/config/env';
import { REDIS_URL } from '@/core/config/redis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log(`App running on port ${REDIS_URL}`);

  // Security headers
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Pipes & Interceptors
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new LangInterceptor());
  app.useGlobalFilters(new AppExceptionFilter());

  app.setGlobalPrefix('api');

  await app.listen(env.APP_PORT ?? 3000);
}
bootstrap();
