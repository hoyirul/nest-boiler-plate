/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/action/action.module.ts
 */

import { Module } from "@nestjs/common";
import { ActionController } from "./controllers/action.controller";
import { ActionUseCase } from "./usecases/action.usecase";
import { ActionRepository } from "./repositories/action.repository";
import { AuthModule } from "@/modules/v1/auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [ActionController],
  providers: [
    ActionUseCase, 
    ActionRepository
  ],
})
export class ActionModule {}
