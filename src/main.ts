import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LangInterceptor } from '@/shared/interceptors/lang.interceptor';
import { AppExceptionFilter } from '@/shared/filters/app-exception.filter';
import { getPool } from "@/core/db/db-registry";
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // check connection to database
  // ✅ CHECK DB CONNECTION
  // try {
  //   const pool = getPool();
  //   await pool.query("SELECT 1");
  //   console.log("✅ Database connected successfully");
  // } catch (err) {
  //   console.error("❌ Database connection failed", err);
  //   process.exit(1); // stop app if DB fail
  // }

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix('api');
  
  app.useGlobalInterceptors(new LangInterceptor());
  app.useGlobalFilters(new AppExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
