/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/status/repositories/status.repository.ts
 */

import { DefaultServer } from "@/core/db";
import { statuses } from "@/core/db/schema/status.schema";
import { eq, count, sql, and, isNull, isNotNull } from "drizzle-orm";
import { CreateStatusDTO, UpdateStatusDTO } from "@/modules/v1/status/domains/status.types";
import { StatusEntity } from "@/modules/v1/status/domains/status.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class StatusRepository {
  public getExecutor(tx?: any) {
    return tx || DefaultServer();
  }

  async isExist(data: CreateStatusDTO | UpdateStatusDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db
      .select({ count: count() })
      .from(statuses)
      .where(
        and(
          isNull(statuses.deleted_at),
          eq(statuses.code, data.code!),
          eq(statuses.label, data.label!)
        )
      )
      .limit(1);

    return Number(result[0].count) > 0;
  }

  async create(data: CreateStatusDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db.insert(statuses).values(data).returning();
    return result[0];
  }

  async findAll(limit: number, offset: number, keywords?: string, filters?: Record<string, string>) {
    const db = await this.getExecutor();
    const table = statuses;

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
      .select()
      .from(table)
      .where(sql.join(conditions, ' AND '))
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${table}.created_at DESC`);

    const totalResult = await db
      .select({ value: count() })
      .from(table)
      .where(sql.join(conditions, ' AND '));

    const data = StatusEntity.fromRows(rows);
    return {
      data,
      total: Number(totalResult[0].value),
    };
  }

  async findById(id: number, withDeleted = false) {
    const db = await this.getExecutor();
    const result = await db
      .select()
      .from(statuses)
      .where(
        and(
          withDeleted ? sql`TRUE` : isNull(statuses.deleted_at),
          eq(statuses.id, id),
        )
      )
      .limit(1);
    
    return result[0] ?? null;
  }

  async update(id: number, data: UpdateStatusDTO, tx?: any) {
    console.log('Updating status with id:', id, 'and data:', data);
    const db = await this.getExecutor(tx);
    const result = await db
      .update(statuses)
      .set({
        ...data,
        updated_at: sql`now()`,
      })
      .where(
        and(
          isNull(statuses.deleted_at),
          eq(statuses.id, id),
        )
      )
      .returning();

    console.log('Update result:', result);

    return result[0] ?? null;
  }

  async delete(id: number, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(statuses)
      .set({ deleted_at: sql`now()` })
      .where(
        and(
          isNull(statuses.deleted_at),
          eq(statuses.id, id),
        )
      )
      .returning();
  }

  async restore(id: number, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(statuses)
      .set({ deleted_at: null })
      .where(
        and(
          eq(statuses.id, id),
          isNotNull(statuses.deleted_at),
        )
      )
      .returning();
  }
}
