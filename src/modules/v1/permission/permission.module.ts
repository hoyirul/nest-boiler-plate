import { Module } from "@nestjs/common";
import { PermissionController } from "./controllers/permission.controller";
import { PermissionUseCase } from "./usecases/permission.usecase";
import { PermissionRepository } from "./repositories/permission.repository";
import { AuthModule } from "@/modules/v1/auth/auth.module";
import { RedisCache } from "@/shared/redis/cache.redis";
import { AuthProvider } from "@/shared/providers/auth.provider";

@Module({
  imports: [AuthModule],
  controllers: [PermissionController],
  providers: [
    PermissionUseCase, 
    PermissionRepository,
    RedisCache
  ],
})
export class PermissionModule {}