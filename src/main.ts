import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LangInterceptor } from '@/shared/interceptors/lang.interceptor';
import { AppExceptionFilter } from '@/shared/filters/app-exception.filter';
import helmet from 'helmet';
import { corsOrigins, env } from '@/core/config/env';
import { REDIS_URL } from '@/core/config/redis';
import cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // cookie
  app.use(cookieParser());

  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }));

  // CORS
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization',
      'Accept-Language',
    ],
    credentials: true,
  });

  // Pipes & Interceptors
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalInterceptors(new LangInterceptor());
  app.useGlobalFilters(new AppExceptionFilter());

  app.setGlobalPrefix('api');
  
  // server listen
  console.log(`Starting server on port ${env.APP_HOST}:${env.APP_PORT ?? 3000}...`);
  await app.listen(env.APP_PORT ?? 3000);
}
bootstrap();
