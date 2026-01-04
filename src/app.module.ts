import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/v1/auth/auth.module';
import { UserModule } from '@/modules/v1/user/user.module';
import { RoleModule } from '@/modules/v1/role/role.module';
import { PermissionModule } from '@/modules/v1/permission/permission.module';
import { DivisionModule } from '@/modules/v1/division/division.module';
import { DepartmentModule } from '@/modules/v1/department/department.module';
import { PositionModule } from '@/modules/v1/position/position.module';
import { ExampleModule } from '@/modules/v1/example/example.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { env } from '@/core/config/env';
import { APP_GUARD } from '@nestjs/core';
import { AuthProvider } from '@/shared/providers/auth.provider';

@Module({
  imports: [
    AuthModule, 
    UserModule,
    RoleModule,
    PermissionModule,
    DivisionModule,
    PositionModule,
    DepartmentModule,
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
    AuthProvider
  ],
})
export class AppModule {}
