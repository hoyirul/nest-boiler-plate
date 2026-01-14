import { DefaultServer } from "@/core/db";
import { examples } from "@/core/db/schema/example.schema";
import { eq, count, sql, and, isNull, SQL } from "drizzle-orm";
import { CreateExampleDTO, UpdateExampleDTO } from "@/modules/v1/example/domains/example.types";
import { Injectable } from "@nestjs/common";
import { ExampleEntity } from "@/modules/v1/example/domains/example.entity";
import { statuses } from "@/core/db/schema/status.schema";
import { getTransitions } from "@/shared/services/approvals/approval.constants";

@Injectable()
export class ExampleRepository {

  public getExecutor(tx?: any) {
    return tx || DefaultServer();
  }

  async isExist(name: string) {
    const db = await this.getExecutor();
    name = name.toLowerCase();
    const result = await db
      .select({ value: count() })
      .from(examples)
      .where(
        and(
          isNull(examples.deleted_at),
          eq(examples.name, name),
        )
      );

    return Number(result[0].value) > 0;
  }

  async create(data: CreateExampleDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db.insert(examples).values(data).returning();
    return result[0];
  }

  async findAll(limit: number, offset: number, keywords?: string, filters?: Record<string, string>) {
    const db = await this.getExecutor();
    const table = examples;

    // Build dynamic where clause
    const conditions = [sql`${table}.deleted_at IS NULL`];

    if (keywords) {
      conditions.push(sql`${table}.name ILIKE ${'%' + keywords + '%'}`);
    }

    // Dynamic filters
    const filterHandlers: Record<string, (value: string) => SQL> = {
      status: (value) => eq(statuses.code, value),
    };

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        const handler = filterHandlers[key];
        if (handler) {
          conditions.push(handler(value));
        }
      }
    }

    console.log("DYNAMIC CONDITIONS:", conditions);

    var rows = await db
      .select({
        id: table.id,
        name: table.name,
        attachment: table.attachment,
        status: {
          id: statuses.id,
          code: statuses.code,
          label: statuses.label,
          sort_order: statuses.sort_order,
        },
        created_at: table.created_at,
        updated_at: table.updated_at,
      })
      .from(table)
      .innerJoin(statuses, eq(examples.status_id, statuses.id))
      .where(sql.join(conditions, sql` AND `))
      .limit(limit)
      .offset(offset)
      .orderBy(sql`updated_at DESC`);

    const totalResult = await db
      .select({ value: count() })
      .from(table)
      .innerJoin(statuses, eq(examples.status_id, statuses.id))
      .where(sql.join(conditions, sql` AND `));

    const data = ExampleEntity.fromRows(rows);
    
    return {
      data,
      total: Number(totalResult[0].value),
    };
  }

  async findById(id: number, withDeleted = false) {
    const db = await this.getExecutor();

    const result = await db
      .select({
        id: examples.id,
        name: examples.name,
        attachment: examples.attachment,
        status: {
          id: statuses.id,
          code: statuses.code,
          label: statuses.label,
          sort_order: statuses.sort_order,
        },
        created_at: examples.created_at,
        updated_at: examples.updated_at,
      })
      .from(examples)
      .innerJoin(statuses, eq(examples.status_id, statuses.id))
      .where(
        and(
          withDeleted ? sql`TRUE` : isNull(examples.deleted_at),
          eq(examples.id, id),
        )
      )
      .limit(1);

    return result[0] ? new ExampleEntity(result[0]) : null;
  }

  async update(id: number, data: UpdateExampleDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db
      .update(examples)
      .set({
        ...data,
        updated_at: sql`now()`,
      })
      .where(
        and(
          isNull(examples.deleted_at),
          eq(examples.id, id),
        )
      )
      .returning();

    return result[0] ?? null;
  }

  async delete(id: number, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(examples)
      .set({ deleted_at: sql`now()` })
      .where(
        and(
          isNull(examples.deleted_at),
          eq(examples.id, id),
        )
      )
      .returning();
  }

  async restore(id: number, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(examples)
      .set({ deleted_at: null })
      .where(
        and(
          eq(examples.id, id),
        )
      )
      .returning();
  }

  // Approval and logging related methods can be added here
  async changeStatus(id: number, statusId: number, tx?: any) {
    const db = await this.getExecutor(tx);
    
    const result = await db
      .update(examples)
      .set({
        status_id: statusId,
        updated_at: sql`now()`,
      })
      .where(
        and(
          isNull(examples.deleted_at),
          eq(examples.id, id),
        )
      )
      .returning();

    return result[0] ?? null;
  }

  async checkStatus(currentStatusId: number, newStatusId: number) {
    const db = await this.getExecutor();
    const currentStatus = await db
      .select({
        id: statuses.id,
        code: statuses.code,
        label: statuses.label,
        sort_order: statuses.sort_order,
      })
      .from(statuses)
      .where(eq(statuses.id, currentStatusId));

    const newStatus = await db
      .select({
        id: statuses.id,
        code: statuses.code,
        label: statuses.label,
        sort_order: statuses.sort_order,
      })
      .from(statuses)
      .where(eq(statuses.id, newStatusId));
      
    return {
      currentStatus: currentStatus[0],
      newStatus: newStatus[0],
    }
  }

  async getNextStatusByAction(currentStatusCode: string, actionCode: string) {
    const from = currentStatusCode?.toLowerCase().trim();
    const action = actionCode?.toLowerCase().trim();

    const transition = getTransitions['examples'].find(
      (t: { fromStatus: string; action: string; }) =>
        t.fromStatus.toLowerCase() === from &&
        t.action.toLowerCase() === action
    );

    console.log("TRANSITION FOUND:", transition);

    if (!transition) return null;

    const db = await this.getExecutor();

    const status = await db
      .select({
        id: statuses.id,
        code: statuses.code,
        label: statuses.label,
        sort_order: statuses.sort_order,
      })
      .from(statuses)
      .where(eq(statuses.code, transition.toStatus));

    return status[0];
  }
}
