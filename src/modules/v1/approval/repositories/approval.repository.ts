/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/approval/repositories/approval.repository.ts
 */

import { DefaultServer } from "@/core/db";
import { approvals } from "@/core/db/schema/approval.schema";
import { users } from "@/core/db/schema/user.schema";
import { divisions } from "@/core/db/schema/division.schema";
import { departments } from "@/core/db/schema/department.schema";
import { positions } from "@/core/db/schema/position.schema";
import { statuses } from "@/core/db/schema/status.schema";
import { eq, count, sql, and, isNull, isNotNull } from "drizzle-orm";
import { CreateApprovalDTO, UpdateApprovalDTO } from "@/modules/v1/approval/domains/approval.types";
import { ApprovalEntity } from "@/modules/v1/approval/domains/approval.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ApprovalRepository {
  public getExecutor(tx?: any) {
    return tx || DefaultServer();
  }

  async isExist(data: CreateApprovalDTO | UpdateApprovalDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db
      .select({ count: count() })
      .from(approvals)
      .where(
        and(
          isNull(approvals.deleted_at),
          // Add your unique fields check here
        )
      )
      .limit(1);

    return Number(result[0].count) > 0;
  }

  async create(data: CreateApprovalDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db.insert(approvals).values(data).returning();
    return result[0];
  }

  async findAll(limit: number, offset: number, keywords?: string, filters?: Record<string, string>) {
    const db = await this.getExecutor();
    const table = approvals;

    const conditions = [sql`${table}.deleted_at IS NULL`];
    if (keywords) {
      conditions.push(sql`${table}.name ILIKE ${'%' + keywords + '%'}`);
    }

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        conditions.push(sql`${table}.${key} = ${value}`);
      }
    }

    const rows = await db
      .select({
        id: table.id,
        model_type: table.model_type,
        approver_id: table.approver_id,
        step: table.step,
        status: {
          id: statuses.id,
          code: statuses.code,
          label: statuses.label,
          sort_order: statuses.sort_order,
        },
        remarks: table.remarks,
        created_at: table.created_at,
        updated_at: table.updated_at,
        deleted_at: table.deleted_at,
      })
      .from(table)
      .innerJoin(statuses, eq(table.status_id, statuses.id))
      .where(sql.join(conditions, ' AND '))
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${table}.created_at DESC`);

    const totalResult = await db
      .select({ value: count() })
      .from(table)
      .where(sql.join(conditions, ' AND '));

    const data = ApprovalEntity.fromRows(rows);
    return {
      data,
      total: Number(totalResult[0].value),
    };
  }

  async findById(id: number, withDeleted = false) {
    const db = await this.getExecutor();
    const result = await db
      .select({
        id: approvals.id,
        model_type: approvals.model_type,
        approver_id: approvals.approver_id,
        step: approvals.step,
        status: {
          id: statuses.id,
          code: statuses.code,
          label: statuses.label,
          sort_order: statuses.sort_order,
        },
        remarks: approvals.remarks,
        created_at: approvals.created_at,
        updated_at: approvals.updated_at,
        deleted_at: approvals.deleted_at,
      })
      .from(approvals)
      .innerJoin(statuses, eq(approvals.status_id, statuses.id))
      .where(
        and(
          withDeleted ? sql`TRUE` : isNull(approvals.deleted_at),
          eq(approvals.id, id),
        )
      )
      .limit(1);
    
    return result[0] ?? null;
  }

  async update(id: number, data: UpdateApprovalDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db
      .update(approvals)
      .set({
        ...data,
        updated_at: sql`now()`,
      })
      .where(
        and(
          isNull(approvals.deleted_at),
          eq(approvals.id, id),
        )
      )
      .returning();

    return result[0] ?? null;
  }

  async delete(id: number, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(approvals)
      .set({ deleted_at: sql`now()` })
      .where(
        and(
          isNull(approvals.deleted_at),
          eq(approvals.id, id),
        )
      )
      .returning();
  }

  async restore(id: number, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(approvals)
      .set({ deleted_at: null })
      .where(
        and(
          eq(approvals.id, id),
          isNotNull(approvals.deleted_at),
        )
      )
      .returning();
  }

  async findByModelType(modelType: string, tx?: any) {
    const db = await this.getExecutor(tx);

    return db
      .select({
        id: approvals.id,
        step: approvals.step,
        approver_id: approvals.approver_id,

        approver: {
          id: users.id,
          name: users.name,
          division: {
            id: divisions.id,
            name: divisions.name,
          },
          department: {
            id: departments.id,
            name: departments.name,
          },
          position: {
            id: positions.id,
            name: positions.name,
          },
        },

        status_id: statuses.id,
        status: {
          id: statuses.id,
          code: statuses.code,
          label: statuses.label
        },
      })
      .from(approvals)
      .innerJoin(users, eq(users.id, approvals.approver_id))
      .innerJoin(divisions, eq(divisions.id, users.division_id))
      .innerJoin(departments, eq(departments.id, users.department_id))
      .innerJoin(positions, eq(positions.id, users.position_id))
      .innerJoin(statuses, eq(statuses.id, approvals.status_id))
      .where(eq(approvals.model_type, modelType))
      .orderBy(approvals.step);
  }

  async findByIdAndApprover(
    approvalId: number,
    approverId: string,
    tx?: any,
  ) {
    const db = await this.getExecutor(tx);

    return db
      .select()
      .from(approvals)
      .where(
        and(
          eq(approvals.id, approvalId),
          eq(approvals.approver_id, approverId),
          isNull(approvals.deleted_at),
        )
      )
      .limit(1)
      .then((res: any[]) => res[0] ?? null);
  }
}
