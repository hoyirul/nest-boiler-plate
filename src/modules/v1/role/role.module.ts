import { Module } from "@nestjs/common";
import { RoleController } from "./controllers/role.controller";
import { RoleUseCase } from "./usecases/role.usecase";
import { RoleRepository } from "./repositories/role.repository";
import { AuthModule } from "@/modules/v1/auth/auth.module";
import { RedisCache } from "@/shared/redis/cache.redis";

@Module({
  imports: [AuthModule],
  controllers: [RoleController],
  providers: [
    RoleUseCase, 
    RoleRepository,
    RedisCache
  ],
})
export class RoleModule {}