import { DefaultServer } from "@/core/db";
import { roles } from "@/core/db/schema/role.schema";
import { users } from "@/core/db/schema/user.schema";
import { modelHasRoles } from "@/core/db/schema/model-has-roles.schema";
import { eq, count, sql, and, isNull } from "drizzle-orm";
import { 
  CreateRoleDTO, 
  UpdateRoleDTO, 
  AssignRoleDTO, 
  RevokeRoleDTO 
} from "@/modules/v1/role/domains/role.types";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RoleRepository {
  public getExecutor(tx?: any) {
    return tx || DefaultServer();
  }

  async isExist(name: string) {
    const db = await this.getExecutor();
    name = name.toLowerCase();
    const result = await db
      .select({ value: count() })
      .from(roles)
      .where(
        and(
          isNull(roles.deleted_at),
          eq(roles.name, name),
        )
      );

    return Number(result[0].value) > 0;
  }

  async create(data: CreateRoleDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    // lowecase
    data.name = data.name.toLowerCase();
    const result = await db.insert(roles).values({
      name: data.name,
      guard_name: 'api',
    }).returning();
    return result[0];
  }

  async findAll(limit: number, offset: number, keywords?: string, filters?: Record<string, string>) {
    const db = await this.getExecutor();
    const table = roles;

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
        guard_name: table.guard_name,
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

  async findById(id: number, withDeleted = false) {
    const db = await this.getExecutor();
    const result = await db
      .select({
        id: roles.id,
        name: roles.name,
        guard_name: roles.guard_name,
        created_at: roles.created_at,
        updated_at: roles.updated_at,
      })
      .from(roles)
      .where(
        and(
          withDeleted ? sql`TRUE` : isNull(roles.deleted_at),
          eq(roles.id, id),
        )
      )
      .limit(1);

    return result[0] ?? null;
  }

  async update(id: number, data: UpdateRoleDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    if (data.name) {
      data.name = data.name.toLowerCase();
    }
    const result = await db
      .update(roles)
      .set({
        ...data,
        updated_at: sql`now()`,
      })
      .where(
        and(
          isNull(roles.deleted_at),
          eq(roles.id, id),
        )
      )
      .returning();

    return result[0] ?? null;
  }

  async delete(id: number, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(roles)
      .set({ deleted_at: sql`now()` })
      .where(
        and(
          isNull(roles.deleted_at),
          eq(roles.id, id),
        )
      )
      .returning();
  }

  async restore(id: number, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(roles)
      .set({ deleted_at: null })
      .where(
        and(
          eq(roles.id, id),
        )
      )
      .returning();
  }

  // For RBAC
  async isExistRole(data: AssignRoleDTO | RevokeRoleDTO) {
    const db = await this.getExecutor();
    const result = await db
      .select({ value: count() })
      .from(modelHasRoles)
      .where(
        and(
          eq(sql`role_id`, data.role_id),
          eq(sql`model_type`, 'User'),
          eq(sql`model_id`, data.model_id),
        )
      );

    return Number(result[0].value) > 0;
  }

  async findUserById(id: string) {
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

  async assignRoleToUser(data: AssignRoleDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    await db.insert(modelHasRoles).values({
      role_id: data.role_id,
      model_type: 'User',
      model_id: data.model_id,
    }).onConflictDoNothing();

    return true;
  }

  async revokeRoleFromUser(data: RevokeRoleDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db
      .delete(modelHasRoles)
      .where(
        and(
          eq(sql`role_id`, data.role_id),
          eq(sql`model_type`, 'User'),
          eq(sql`model_id`, data.model_id),
        )
      );
      
    return result;
  }
}
