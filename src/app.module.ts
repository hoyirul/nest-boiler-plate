import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/v1/auth/auth.module';
import { ExampleModule } from '@/modules/v1/example/example.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { env } from '@/core/config/env';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    AuthModule, 
    ExampleModule, 
    ThrottlerModule.forRoot([
      {
        ttl: Number(env.RATE_LIMIT_GLOBAL_TTL) || 60,
        limit: Number(env.RATE_LIMIT_GLOBAL_COUNT) || 2,
      }
    ]),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
