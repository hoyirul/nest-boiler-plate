/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/position/position.module.ts
 */

import { Module } from "@nestjs/common";
import { PositionController } from "./controllers/position.controller";
import { PositionUseCase } from "./usecases/position.usecase";
import { PositionRepository } from "./repositories/position.repository";
import { AuthModule } from "@/modules/v1/auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [PositionController],
  providers: [
    PositionUseCase, 
    PositionRepository
  ],
})
export class PositionModule {}
