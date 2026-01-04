import { DefaultServer } from "@/core/db";
import { users } from "@/core/db/schema/user.schema";
import { eq, count, sql, and, isNull } from "drizzle-orm";
import { 
  CreateUserDTO,
  UpdateUserDTO,
  UpdatePasswordDTO,
  UpdateEmailDTO,
} from "@/modules/v1/user/domains/user.types";
// uuid
import { v4 as uuidv4 } from 'uuid';
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserRepository {
  public getExecutor(tx?: any) {
    return tx || DefaultServer();
  }

  async isExist(name: string, email: string) {
    const db = await this.getExecutor();
    name = name.toLowerCase();
    const result = await db
      .select({ value: count() })
      .from(users)
      .where(
        and(
          eq(users.name, name),
          eq(users.email, email),
        )
      );

    return Number(result[0].value) > 0;
  }

  async create(data: CreateUserDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db.insert(users).values({
      id: uuidv4(),
      name: data.name,
      email: data.email,
      password: data.password,
    }).returning();
    return result[0];
  }

  async findAll(limit: number, offset: number, keywords?: string, filters?: Record<string, string>) {
    const db = await this.getExecutor();
    const table = users;

    // Build dynamic where clause no deleted_at
    const conditions: any[] = [];

    if (keywords) {
      conditions.push(sql`${table}.name ILIKE ${'%' + keywords + '%'} OR ${table}.email ILIKE ${'%' + keywords + '%'}`);
    }

    // Dynamic filters
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        conditions.push(sql`${table}.${key} = ${value}`);
      }
    }

    const whereClause = conditions.length
    ? sql.join(conditions, sql` AND `)
    : sql`TRUE`;

    const data = await db
      .select({
        id: table.id,
        name: table.name,
        email: table.email,
        status: table.status,
        created_at: table.created_at,
        updated_at: table.updated_at,
      })
      .from(table)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(sql`created_at DESC`);

    const totalResult = await db
      .select({ value: count() })
      .from(table)
      .where(whereClause);

    return {
      data,
      total: Number(totalResult[0].value),
    };
  }

  async findByIdWithPassword(id: string) {
    const db = await this.getExecutor();
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        password: users.password,
        status: users.status,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async findById(id: string) {
    const db = await this.getExecutor();
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        status: users.status,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async update(id: string, data: UpdateUserDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db
      .update(users)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return result[0] ?? null;
  }

  async updateStatus(id: string, status: string, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(users)
      .set({ status: status, updated_at: new Date() })
      .where(eq(users.id, id))
      .returning();
  }

  async updatePassword(id: string, data: UpdatePasswordDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(users)
      .set({ password: data.new_password, updated_at: new Date() })
      .where(eq(users.id, id))
      .returning();
  }

  async updateEmail(id: string, data: UpdateEmailDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(users)
      .set({ email: data.email, updated_at: new Date() })
      .where(eq(users.id, id))
      .returning();
  }
}
