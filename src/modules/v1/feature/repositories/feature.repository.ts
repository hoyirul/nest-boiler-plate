/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/feature/repositories/feature.repository.ts
 */

import { DefaultServer } from "@/core/db";
import { features } from "@/core/db/schema/feature.schema";
import { eq, count, sql, and, isNull, isNotNull } from "drizzle-orm";
import { CreateFeatureDTO, UpdateFeatureDTO } from "@/modules/v1/feature/domains/feature.types";
import { FeatureEntity } from "@/modules/v1/feature/domains/feature.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class FeatureRepository {
  public getExecutor(tx?: any) {
    return tx || DefaultServer();
  }

  async isExist(data: CreateFeatureDTO | UpdateFeatureDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db
      .select({ count: count() })
      .from(features)
      .where(
        and(
          isNull(features.deleted_at),
          eq(features.parent_id, data.parent_id!),
          eq(features.code, data.code!),
          eq(features.name, data.name!)
        )
      )
      .limit(1);

    return Number(result[0].count) > 0;
  }

  async create(data: CreateFeatureDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db.insert(features).values(data).returning();
    return result[0];
  }

  async findAll(limit: number, offset: number, keywords?: string, filters?: Record<string, string>) {
    const db = await this.getExecutor();
    const table = features;

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

    const data = FeatureEntity.fromRows(rows);
    return {
      data,
      total: Number(totalResult[0].value),
    };
  }

  async findById(id: number, withDeleted = false) {
    const db = await this.getExecutor();
    const result = await db
      .select()
      .from(features)
      .where(
        and(
          withDeleted ? sql`TRUE` : isNull(features.deleted_at),
          eq(features.id, id),
        )
      )
      .limit(1);
    
    return result[0] ?? null;
  }

  async update(id: number, data: UpdateFeatureDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db
      .update(features)
      .set({
        ...data,
        updated_at: sql`now()`,
      })
      .where(
        and(
          isNull(features.deleted_at),
          eq(features.id, id),
        )
      )
      .returning();

    return result[0] ?? null;
  }

  async delete(id: number, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(features)
      .set({ deleted_at: sql`now()` })
      .where(
        and(
          isNull(features.deleted_at),
          eq(features.id, id),
        )
      )
      .returning();
  }

  async restore(id: number, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(features)
      .set({ deleted_at: null })
      .where(
        and(
          eq(features.id, id),
          isNotNull(features.deleted_at),
        )
      )
      .returning();
  }
}
