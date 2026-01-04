/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/department/repositories/department.repository.ts
 */

import { DefaultServer } from "@/core/db";
import { departments } from "@/core/db/schema/department.schema";
import { eq, count, sql, and, isNull } from "drizzle-orm";
import { CreateDepartmentDTO, UpdateDepartmentDTO } from "@/modules/v1/department/domains/department.types";
import { Injectable } from "@nestjs/common";
import { generateNextCode } from "@/shared/utils/generator";

@Injectable()
export class DepartmentRepository {
  public getExecutor(tx?: any) {
    return tx || DefaultServer();
  }

  async isExist(data: CreateDepartmentDTO | UpdateDepartmentDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db
      .select({ count: count() })
      .from(departments)
      .where(
        and(
          isNull(departments.deleted_at),
          eq(departments.division_id, data.division_id!),
          eq(departments.name, data.name!),
        )
      )
      .limit(1);

    return Number(result[0].count) > 0;
  }

  async create(data: CreateDepartmentDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const total = await db
      .select({ value: count() })
      .from(departments);

    const code = generateNextCode('DEP', (Number(total[0].value) + 1), 3);

    const result = await db.insert(departments).values({ ...data, code }).returning();
    return result[0];
  }

  async findAll(limit: number, offset: number, keywords?: string, filters?: Record<string, string>) {
    const db = await this.getExecutor();
    const table = departments;

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
        division_id: table.division_id,
        name: table.name,
        description: table.description,
        created_at: table.created_at,
        updated_at: table.updated_at,
      })
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
      .select({
        id: departments.id,
        code: departments.code,
        division_id: departments.division_id,
        name: departments.name,
        description: departments.description,
        created_at: departments.created_at,
        updated_at: departments.updated_at,
      })
      .from(departments)
      .where(
        and(
          withDeleted ? sql`TRUE` : isNull(departments.deleted_at),
          eq(departments.id, id),
        )
      )
      .limit(1);

    return result[0] ?? null;
  }

  async update(id: number, data: UpdateDepartmentDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db
      .update(departments)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(
        and(
          isNull(departments.deleted_at),
          eq(departments.id, id),
        )
      )
      .returning();

    return result[0] ?? null;
  }

  async delete(id: number, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(departments)
      .set({ deleted_at: new Date() })
      .where(
        and(
          isNull(departments.deleted_at),
          eq(departments.id, id),
        )
      )
      .returning();
  }

  async restore(id: number, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(departments)
      .set({ deleted_at: null })
      .where(
        and(
          eq(departments.id, id),
          // only restore if it is deleted
          sql`$departments.deleted_at IS NOT NULL`,
        )
      )
      .returning();
  }
}
