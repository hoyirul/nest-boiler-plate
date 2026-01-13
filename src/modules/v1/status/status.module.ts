/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/status/status.module.ts
 */

import { Module } from "@nestjs/common";
import { StatusController } from "./controllers/status.controller";
import { StatusUseCase } from "./usecases/status.usecase";
import { StatusRepository } from "./repositories/status.repository";
import { AuthModule } from "@/modules/v1/auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [StatusController],
  providers: [
    StatusUseCase, 
    StatusRepository
  ],
})
export class StatusModule {}
