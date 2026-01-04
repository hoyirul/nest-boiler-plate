/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/position/repositories/position.repository.ts
 */

import { DefaultServer } from "@/core/db";
import { positions } from "@/core/db/schema/position.schema";
import { eq, count, sql, and, isNull, isNotNull } from "drizzle-orm";
import { CreatePositionDTO, UpdatePositionDTO } from "@/modules/v1/position/domains/position.types";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PositionRepository {
  public getExecutor(tx?: any) {
    return tx || DefaultServer();
  }

  async isExist(name: string, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db
      .select({ count: count() })
      .from(positions)
      .where(
        and(
          isNull(positions.deleted_at),
          eq(positions.name, name.toLowerCase()),
        )
      )
      .limit(1);

    return Number(result[0].count) > 0;
  }

  async create(data: CreatePositionDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db.insert(positions).values(data).returning();
    return result[0];
  }

  async findAll(limit: number, offset: number, keywords?: string, filters?: Record<string, string>) {
    const db = await this.getExecutor();
    const table = positions;

    const conditions = [sql`${table}.deleted_at IS NULL`];
    if (keywords) {
      conditions.push(sql`${table}.name ILIKE ${'%' + keywords + '%'}`);
    }

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        conditions.push(sql`${table}.${key} = ${value}`);
      }
    }

    const data = await db
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

    return {
      data,
      total: Number(totalResult[0].value),
    };
  }

  async findById(id: number, withDeleted = false) {
    const db = await this.getExecutor();
    const result = await db
      .select()
      .from(positions)
      .where(
        and(
          withDeleted ? sql`TRUE` : isNull(positions.deleted_at),
          eq(positions.id, id),
        )
      )
      .limit(1);

    return result[0] ?? null;
  }

  async update(id: number, data: UpdatePositionDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db
      .update(positions)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(
        and(
          isNull(positions.deleted_at),
          eq(positions.id, id),
        )
      )
      .returning();

    return result[0] ?? null;
  }

  async delete(id: number, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(positions)
      .set({ deleted_at: new Date() })
      .where(
        and(
          isNull(positions.deleted_at),
          eq(positions.id, id),
        )
      )
      .returning();
  }

  async restore(id: number, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(positions)
      .set({ deleted_at: null })
      .where(
        and(
          eq(positions.id, id),
          isNotNull(positions.deleted_at),
        )
      )
      .returning();
  }
}
