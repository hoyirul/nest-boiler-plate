import { Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';

import { DefaultServer } from '@/core/db';
import { users } from '@/core/db/schema/user.schema';
import { modelHasPermissions } from '@/core/db/schema/model-has-permissions.schema';
import { modelHasRoles } from '@/core/db/schema/model-has-roles.schema';
import { roleHasPermissions } from '@/core/db/schema/role-has-permissions.schema';
import { permissions } from '@/core/db/schema/permission.schema';
import { roles } from '@/core/db/schema/role.schema';
import { AuthEntity } from '@/modules/v1/auth/domains/auth.entity';

@Injectable()
export class AuthRepository {
  private async getExecutor(tx?: any) {
    return tx ?? DefaultServer();
  }

  async findByEmail(
    email: string,
    tx?: any,
  ): Promise<AuthEntity | null> {
    const db = await this.getExecutor(tx);

    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = result[0];
    if (!user) return null;

    return new AuthEntity({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  }

  async findById(
    id: String,
    tx?: any,
  ): Promise<AuthEntity | null> {
    const db = await this.getExecutor(tx);

    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, String(id)))
      .limit(1);

    const user = result[0];
    if (!user) return null;

    return new AuthEntity({
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  }

  async findByIdWithRbac(
    id: string, 
    tx?: any
  ): Promise<AuthEntity | null> {
    const db = await this.getExecutor(tx);

    // 1️⃣ Ambil user
    const userRes = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!userRes[0]) return null;
    const user = userRes[0];

    // 2️⃣ Ambil roles user
    const roleRows = await db
      .select({ id: roles.id, name: roles.name })
      .from(modelHasRoles)
      .innerJoin(roles, eq(modelHasRoles.role_id, roles.id))
      .where(eq(modelHasRoles.model_id, id));

    const roleIds = roleRows.map(r => r.id);

    // 3️⃣ Ambil permissions user langsung
    const permissionRows = await db
      .select({ name: permissions.name })
      .from(modelHasPermissions)
      .innerJoin(
        permissions,
        eq(modelHasPermissions.permission_id, permissions.id),
      )
      .where(eq(modelHasPermissions.model_id, id));

    // 4️⃣ Ambil permissions dari role
    let rolePermissionRows: { name: string }[] = [];
    if (roleIds.length > 0) {
      rolePermissionRows = await db
        .select({ name: permissions.name })
        .from(roleHasPermissions)
        .innerJoin(
          permissions,
          eq(roleHasPermissions.permission_id, permissions.id),
        )
        .where(inArray(roleHasPermissions.role_id, roleIds));
    }

    // 5️⃣ Gabungkan semua permission unik
    const allPermissions = [
      ...permissionRows.map(p => p.name),
      ...rolePermissionRows.map(p => p.name),
    ];
    const uniquePermissions = Array.from(new Set(allPermissions));

    // 6️⃣ Return AuthEntity lengkap
    return new AuthEntity({
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
      roles: roleRows.map((r: { name: any; }) => r.name),
      permissions: uniquePermissions,
    });
  }
}
