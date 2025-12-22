import { DefaultServer } from "@/core/db";
import { categories } from "@/core/db/schema/category.schema";
import { eq, count } from "drizzle-orm";
import { UpdateCategoryDTO } from "@/modules/v1/category/domains/category.types";

export class CategoryRepository {
  private getExecutor(tx?: any) {
    return tx || DefaultServer();
  }

  async create(data: { name: string }) {
    const db = await this.getExecutor();
    const result = await db.insert(categories).values(data).returning();
    return result[0];
  }

  async findAll(limit: number, offset: number) {
    const db = await this.getExecutor();

    const data = await db
      .select()
      .from(categories)
      .limit(limit)
      .offset(offset)
      .orderBy(categories.id);

    const totalResult = await db
      .select({ value: count() })
      .from(categories);

    return {
      data,
      total: Number(totalResult[0].value),
    };
  }

  async findById(id: number) {
    const db = await this.getExecutor();
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async update(id: number, data: UpdateCategoryDTO) {
    const db = await this.getExecutor();
    const result = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();

    return result[0] ?? null;
  }

  async delete(id: number) {
    const db = await this.getExecutor();
    return db.delete(categories).where(eq(categories.id, id));
  }
}
