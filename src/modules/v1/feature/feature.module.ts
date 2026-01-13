/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/feature/feature.module.ts
 */

import { Module } from "@nestjs/common";
import { FeatureController } from "./controllers/feature.controller";
import { FeatureUseCase } from "./usecases/feature.usecase";
import { FeatureRepository } from "./repositories/feature.repository";
import { AuthModule } from "@/modules/v1/auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [FeatureController],
  providers: [
    FeatureUseCase, 
    FeatureRepository
  ],
})
export class FeatureModule {}
