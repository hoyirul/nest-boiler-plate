/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/division/repositories/division.repository.ts
 */

import { DefaultServer } from "@/core/db";
import { divisions } from "@/core/db/schema/division.schema";
import { eq, count, sql, and, isNull, isNotNull } from "drizzle-orm";
import { CreateDivisionDTO, UpdateDivisionDTO } from "@/modules/v1/division/domains/division.types";
import { Injectable } from "@nestjs/common";
import { generateNextCode } from "@/shared/utils/generator";

@Injectable()
export class DivisionRepository {
  public getExecutor(tx?: any) {
    return tx || DefaultServer();
  }

  async isExist(name: string, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db
      .select({ count: count() })
      .from(divisions)
      .where(
        and(
          isNull(divisions.deleted_at),
          eq(divisions.name, name.toLowerCase()),
        )
      )
      .limit(1);

    return Number(result[0].count) > 0;
  }

  async create(data: CreateDivisionDTO, tx?: any) {
    const db = await this.getExecutor(tx);

    const total = await db
      .select({ value: count() })
      .from(divisions);

    const code = generateNextCode('DIV', (Number(total[0].value)), 3);

    const result = await db.insert(divisions).values({ ...data, code }).returning();
    return result[0];
  }

  async findAll(limit: number, offset: number, keywords?: string, filters?: Record<string, string>) {
    const db = await this.getExecutor();
    const table = divisions;

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
      .select({
        id: table.id,
        code: table.code,
        name: table.name,
        description: table.description,
        created_at: table.created_at,
        updated_at: table.updated_at,
      })
      .from(table)
      .where(sql.join(conditions, ' AND '))
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${table}.code DESC`);

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
      .select({
        id: divisions.id,
        code: divisions.code,
        name: divisions.name,
        description: divisions.description,
        created_at: divisions.created_at,
        updated_at: divisions.updated_at,
      })
      .from(divisions)
      .where(
        and(
          withDeleted ? sql`TRUE` : isNull(divisions.deleted_at),
          eq(divisions.id, id),
        )
      )
      .limit(1);

    return result[0] ?? null;
  }

  async update(id: number, data: UpdateDivisionDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db
      .update(divisions)
      .set({
        ...data,
        updated_at: sql`now()`,
      })
      .where(
        and(
          isNull(divisions.deleted_at),
          eq(divisions.id, id),
        )
      )
      .returning();

    return result[0] ?? null;
  }

  async delete(id: number, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(divisions)
      .set({ deleted_at: sql`now()` })
      .where(
        and(
          isNull(divisions.deleted_at),
          eq(divisions.id, id),
        )
      )
      .returning();
  }

  async restore(id: number, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(divisions)
      .set({ deleted_at: null })
      .where(
        and(
          eq(divisions.id, id),
          isNotNull(divisions.deleted_at),
        )
      )
      .returning();
  }
}
