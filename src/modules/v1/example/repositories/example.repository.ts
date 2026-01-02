import { DefaultServer } from "@/core/db";
import { examples } from "@/core/db/schema/example.schema";
import { eq, count, sql } from "drizzle-orm";
import { UpdateExampleDTO } from "@/modules/v1/example/domains/example.types";

export class ExampleRepository {
  private getExecutor(tx?: any) {
    return tx || DefaultServer();
  }

  async create(data: { name: string }) {
    const db = await this.getExecutor();
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
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        conditions.push(sql`${table}.${key} = ${value}`);
      }
    }

    const data = await db
      .select({
        id: table.id,
        name: table.name,
        attachment: table.attachment,
        created_at: table.created_at,
        updated_at: table.updated_at,
      })
      .from(table)
      .where(sql.join(conditions, sql` AND `))
      .limit(limit)
      .offset(offset)
      .orderBy(sql`created_at DESC`);

    const totalResult = await db
      .select({ value: count() })
      .from(table)
      .where(sql.join(conditions, sql` AND `));

    return {
      data,
      total: Number(totalResult[0].value),
    };
  }

  async findById(id: number) {
    const db = await this.getExecutor();
    const result = await db
      .select({
        id: examples.id,
        name: examples.name,
        attachment: examples.attachment,
        created_at: examples.created_at,
        updated_at: examples.updated_at,
      })
      .from(examples)
      .where(eq(examples.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async update(id: number, data: UpdateExampleDTO) {
    const db = await this.getExecutor();
    const result = await db
      .update(examples)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(examples.id, id))
      .returning();

    return result[0] ?? null;
  }

  async delete(id: number) {
    const db = await this.getExecutor();
    return db
      .update(examples)
      .set({ deleted_at: new Date() })
      .where(eq(examples.id, id))
      .returning();
  }
}
