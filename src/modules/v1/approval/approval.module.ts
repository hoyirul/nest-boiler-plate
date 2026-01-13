/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/approval/approval.module.ts
 */

import { Module } from "@nestjs/common";
import { ApprovalController } from "./controllers/approval.controller";
import { ApprovalUseCase } from "./usecases/approval.usecase";
import { ApprovalRepository } from "./repositories/approval.repository";
import { ApprovalLogRepository } from "./repositories/approval-log.repository";
import { ApprovalService } from "@/shared/services/approvals/approval.service";
import { AuthModule } from "@/modules/v1/auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [ApprovalController],
  providers: [
    ApprovalUseCase, 
    ApprovalRepository,
    ApprovalLogRepository,
    ApprovalService,
  ],
  exports: [
    ApprovalRepository, 
    ApprovalLogRepository, 
    ApprovalService
  ],
})
export class ApprovalModule {}
