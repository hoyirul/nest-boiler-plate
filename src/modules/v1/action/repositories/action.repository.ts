/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/action/repositories/action.repository.ts
 */

import { DefaultServer } from "@/core/db";
import { actions } from "@/core/db/schema/action.schema";
import { eq, count, sql, and, isNull, isNotNull } from "drizzle-orm";
import { CreateActionDTO, UpdateActionDTO } from "@/modules/v1/action/domains/action.types";
import { ActionEntity } from "@/modules/v1/action/domains/action.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ActionRepository {
  public getExecutor(tx?: any) {
    return tx || DefaultServer();
  }

  async isExist(data: CreateActionDTO | UpdateActionDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db
      .select({ count: count() })
      .from(actions)
      .where(
        and(
          isNull(actions.deleted_at),
          // Add your unique fields check here
        )
      )
      .limit(1);

    return Number(result[0].count) > 0;
  }

  async create(data: CreateActionDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db.insert(actions).values(data).returning();
    return result[0];
  }

  async findAll(limit: number, offset: number, keywords?: string, filters?: Record<string, string>) {
    const db = await this.getExecutor();
    const table = actions;

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

    const data = ActionEntity.fromRows(rows);
    return {
      data,
      total: Number(totalResult[0].value),
    };
  }

  async findById(id: number, withDeleted = false) {
    const db = await this.getExecutor();
    const result = await db
      .select()
      .from(actions)
      .where(
        and(
          withDeleted ? sql`TRUE` : isNull(actions.deleted_at),
          eq(actions.id, id),
        )
      )
      .limit(1);
    
    return result[0] ?? null;
  }

  async update(id: number, data: UpdateActionDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db
      .update(actions)
      .set({
        ...data,
        updated_at: sql`now()`,
      })
      .where(
        and(
          isNull(actions.deleted_at),
          eq(actions.id, id),
        )
      )
      .returning();

    return result[0] ?? null;
  }

  async delete(id: number, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(actions)
      .set({ deleted_at: sql`now()` })
      .where(
        and(
          isNull(actions.deleted_at),
          eq(actions.id, id),
        )
      )
      .returning();
  }

  async restore(id: number, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(actions)
      .set({ deleted_at: null })
      .where(
        and(
          eq(actions.id, id),
          isNotNull(actions.deleted_at),
        )
      )
      .returning();
  }
}
