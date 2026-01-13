/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/approval/repositories/approval-log.repository.ts
 */

import { DefaultServer } from "@/core/db";
import { eq, and } from "drizzle-orm";
import { Injectable } from "@nestjs/common";
import { approvalLogs } from "@/core/db/schema/approval-log.schema";

@Injectable()
export class ApprovalLogRepository {
  public getExecutor(tx?: any) {
    return tx || DefaultServer();
  }

  async create(data: any, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db.insert(approvalLogs).values(data).returning();
    return result[0];
  }

  async findByModel(
    modelType: string,
    modelId: string,
    tx?: any,
  ) {
    const db = await this.getExecutor(tx);

    return db
      .select({
        id: approvalLogs.id,
        approval_id: approvalLogs.approval_id,
        status_from: approvalLogs.status_from,
        status_to: approvalLogs.status_to,
        created_at: approvalLogs.created_at,
      })
      .from(approvalLogs)
      .where(
        and(
          eq(approvalLogs.model_type, modelType),
          eq(approvalLogs.model_id, modelId),
        )
      );
  }
}