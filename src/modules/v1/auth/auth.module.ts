import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthUseCase } from './usecases/auth.usecase';
import { AuthRepository } from './repositories/auth.repository';
import { AuthSessionRedisRepository } from './repositories/auth.redis.repository';

@Module({
  controllers: [AuthController],
  providers: [AuthUseCase, AuthRepository, AuthSessionRedisRepository],
  exports: [AuthUseCase],
})
export class AuthModule {}
