/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/division/division.module.ts
 */

import { Module } from "@nestjs/common";
import { DivisionController } from "./controllers/division.controller";
import { DivisionUseCase } from "./usecases/division.usecase";
import { DivisionRepository } from "./repositories/division.repository";
import { AuthModule } from "@/modules/v1/auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [DivisionController],
  providers: [
    DivisionUseCase, 
    DivisionRepository
  ],
})
export class DivisionModule {}
