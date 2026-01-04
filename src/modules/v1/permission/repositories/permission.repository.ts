import { DefaultServer } from "@/core/db";
import { permissions } from "@/core/db/schema/permission.schema";
import { roles } from "@/core/db/schema/role.schema";
import { users } from "@/core/db/schema/user.schema";
import { roleHasPermissions } from "@/core/db/schema/role-has-permissions.schema";
import { modelHasPermissions } from "@/core/db/schema/model-has-permissions.schema";
import { eq, count, sql, and, isNull, inArray } from "drizzle-orm";
import { 
  CreatePermissionDTO, 
  UpdatePermissionDTO, 
  AssignPermissionRoleDTO, 
  RevokePermissionRoleDTO,
  AssignPermissionUserDTO,
  RevokePermissionUserDTO
} from "@/modules/v1/permission/domains/permission.types";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PermissionRepository {
  public getExecutor(tx?: any) {
    return tx || DefaultServer();
  }

  async isExist(name: string) {
    const db = await this.getExecutor();
    name = name.toLowerCase();
    const result = await db
      .select({ value: count() })
      .from(permissions)
      .where(
        and(
          isNull(permissions.deleted_at),
          eq(permissions.name, name),
        )
      );

    return Number(result[0].value) > 0;
  }

  async create(data: CreatePermissionDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db.insert(permissions).values(data).returning();
    return result[0];
  }

  async findAll(limit: number, offset: number, keywords?: string, filters?: Record<string, string>) {
    const db = await this.getExecutor();
    const table = permissions;

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
        id: permissions.id,
        name: permissions.name,
        created_at: permissions.created_at,
        updated_at: permissions.updated_at,
      })
      .from(permissions)
      .where(
        and(
          withDeleted ? sql`TRUE` : isNull(permissions.deleted_at),
          eq(permissions.id, id),
        )
      )
      .limit(1);

    return result[0] ?? null;
  }

  async findInId(ids: number[], withDeleted = false) {
    const db = await this.getExecutor();
    const result = await db
      .select({
        id: permissions.id,
        name: permissions.name,
        created_at: permissions.created_at,
        updated_at: permissions.updated_at,
      })
      .from(permissions)
      .where(
        and(
          withDeleted ? sql`TRUE` : isNull(permissions.deleted_at),
          inArray(permissions.id, ids),
        )
      )
      .orderBy(sql`created_at DESC`);
    
    return result;
  }

  async update(id: number, data: UpdatePermissionDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db
      .update(permissions)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(
        and(
          isNull(permissions.deleted_at),
          eq(permissions.id, id),
        )
      )
      .returning();

    return result[0] ?? null;
  }

  async delete(id: number, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(permissions)
      .set({ deleted_at: new Date() })
      .where(
        and(
          isNull(permissions.deleted_at),
          eq(permissions.id, id),
        )
      )
      .returning();
  }

  async restore(id: number, tx?: any) {
    const db = await this.getExecutor(tx);
    return db
      .update(permissions)
      .set({ deleted_at: null })
      .where(
        and(
          eq(permissions.id, id),
        )
      )
      .returning();
  }

  // RBAC
  async isExistPermissionRole(data: AssignPermissionRoleDTO | RevokePermissionRoleDTO) {
    const db = await this.getExecutor();
    const result = await db
      .select({ value: count() })
      .from(roleHasPermissions)
      .where(
        and(
          inArray(roleHasPermissions.permission_id, data.permission_ids),
          eq(roleHasPermissions.role_id, data.role_id),
        )
      );

    return Number(result[0].value) > 0;
  }

  async isExistPermissionUser(data: AssignPermissionUserDTO | RevokePermissionUserDTO) {
    const db = await this.getExecutor();
    const result = await db
      .select({ value: count() })
      .from(modelHasPermissions)
      .where(
        and(
          inArray(modelHasPermissions.permission_id, data.permission_ids),
          eq(modelHasPermissions.model_type, 'User'),
          eq(modelHasPermissions.model_id, data.model_id),
        )
      );

    return Number(result[0].value) > 0;
  }
  
  async findRoleById(id: number) {
    const db = await this.getExecutor();
    const result = await db
      .select({
        id: roles.id,
        name: roles.name,
        created_at: roles.created_at,
        updated_at: roles.updated_at,
      })
      .from(roles)
      .where(
        and(
          isNull(roles.deleted_at),
          eq(roles.id, id),
        )
      )
      .limit(1);

    return result[0] ?? null;
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

  async assignPermissionToRole(data: AssignPermissionRoleDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    await db.insert(roleHasPermissions).values(
      data.permission_ids.map((permission_id) => ({
        permission_id,
        role_id: data.role_id,
      }))
    ).onConflictDoNothing();
    
    return true;
  }

  async revokePermissionFromRole(data: RevokePermissionRoleDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db.delete(roleHasPermissions).where(
      and(
        inArray(roleHasPermissions.permission_id, data.permission_ids),
        eq(roleHasPermissions.role_id, data.role_id),
      )
    );

    return result;
  }

  async assignPermissionToUser(data: AssignPermissionUserDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    await db.insert(modelHasPermissions).values(
      data.permission_ids.map((permission_id) => ({
        permission_id,
        model_type: 'User',
        model_id: data.model_id,
      }))
    ).onConflictDoNothing();

    return true;
  }

  async revokePermissionFromUser(data: RevokePermissionUserDTO, tx?: any) {
    const db = await this.getExecutor(tx);
    const result = await db.delete(modelHasPermissions).where(
      and(
        inArray(modelHasPermissions.permission_id, data.permission_ids),
        eq(modelHasPermissions.model_type, 'User'),
        eq(modelHasPermissions.model_id, data.model_id),
      )
    );

    return result;
  }
}