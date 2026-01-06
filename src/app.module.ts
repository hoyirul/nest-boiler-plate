import { Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { env } from '@/core/config/env';
import { APP_GUARD } from '@nestjs/core';
import { AuthProvider } from '@/shared/providers/auth.provider';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { V1Module } from '@/modules/v1/v1.module';

@Module({
  imports: [
    V1Module,
    ThrottlerModule.forRoot([
      {
        ttl: Number(env.RATE_LIMIT_GLOBAL_TTL) || 60,
        limit: Number(env.RATE_LIMIT_GLOBAL_COUNT) || 2,
      }
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public', 'storage'),
      serveRoot: '/storage',
      serveStaticOptions: {
        setHeaders: (res) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
        },
      },
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AuthProvider
  ],
})
export class AppModule {}
