/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/approval/repositories/approval-log.repository.ts
 */

import { DefaultServer } from "@/core/db";
import { eq, and } from "drizzle-orm";
import { Injectable } from "@nestjs/common";
import { approvalLogs } from "@/core/db/schema/approval-log.schema";
import { actions } from "@/core/db/schema/action.schema";
import { statuses } from "@/core/db/schema/status.schema";
import { alias } from "drizzle-orm/pg-core";

@Injectable()
export class ApprovalLogRepository {
  public getExecutor(tx?: any) {
    return tx || DefaultServer();
  }

  async findActionByCode(code: string, tx?: any) {
    const db = await this.getExecutor(tx);

    const result = await db
      .select()
      .from(actions)
      .where(
        eq(actions.code, code)
      )
      .limit(1);

    return result[0];
  }

  async create(data: any,tx?: any) {
    const db = await this.getExecutor(tx);

    const result = await db.insert(approvalLogs).values({
      approval_id: Number(data.approval_id),
      model_type: data.model_type,
      model_id: data.model_id,
      status_from: Number(data.status_from),
      status_to: Number(data.status_to),
      action_id: Number(data.action_id),
      changed_by: data.changed_by,
      note: data.note ?? null,
    }).returning();
    
    return result[0];
  }

  async findByModel(
    modelType: string,
    modelId: string,
    tx?: any,
  ) {
    const db = await this.getExecutor(tx);

    const statusFrom = alias(statuses, "status_from");
    const statusTo = alias(statuses, "status_to");
    return db
      .select({
        id: approvalLogs.id,
        approval_id: approvalLogs.approval_id,
        status_from: {
          id: statusFrom.id,
          code: statusFrom.code,
          label: statusFrom.label,
        },
        action_id: approvalLogs.action_id,
        status_to: {
          id: statusTo.id,
          code: statusTo.code,
          label: statusTo.label,
        },
        created_at: approvalLogs.created_at,
      })
      .from(approvalLogs)
      .innerJoin(statusFrom, eq(approvalLogs.status_from, statusFrom.id))
      .innerJoin(statusTo, eq(approvalLogs.status_to, statusTo.id))
      .where(
        and(
          eq(approvalLogs.model_type, modelType),
          eq(approvalLogs.model_id, modelId),
        )
      );
  }
}