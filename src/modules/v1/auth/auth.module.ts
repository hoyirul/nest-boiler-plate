import { Module, forwardRef, Scope } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthUseCase } from './usecases/auth.usecase';
import { AuthRepository } from './repositories/auth.repository';
import { RedisCache } from '@/shared/redis/cache.redis';
import { AuthProvider } from '@/shared/providers/auth.provider';
import { FeatureModule } from '@/modules/v1/feature/feature.module';

@Module({
  imports: [
    forwardRef(() => FeatureModule)
  ],
  controllers: [AuthController],
  providers: [
    AuthUseCase,
    AuthRepository,
    RedisCache,
    {
      provide: AuthProvider,
      useClass: AuthProvider,
      scope: Scope.REQUEST,
    },
  ],
  exports: [AuthUseCase, AuthProvider],
})
export class AuthModule {}
