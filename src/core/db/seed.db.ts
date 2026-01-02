import { DefaultServer } from "@/core/db";
import { users } from "@/core/db/schema/user.schema";
import { roles } from "@/core/db/schema/role.schema";
import { permissions } from "@/core/db/schema/permission.schema";
import { roleHasPermissions } from "@/core/db/schema/role-has-permissions.schema";
import { modelHasRoles } from "@/core/db/schema/model-has-roles.schema";
import { modelHasPermissions } from "@/core/db/schema/model-has-permissions.schema";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  const db = DefaultServer();

  try {
    console.log("Seeding Roles...");
    const insertedRoles = await db
      .insert(roles)
      .values([
        { name: "superadmin", guard_name: "api", level: 1 },
        { name: "admin", guard_name: "api", level: 2 },
        { name: "user", guard_name: "api", level: 3 },
      ])
      .returning({ id: roles.id, name: roles.name });

    const superadminRole = insertedRoles.find(r => r.name === "superadmin")!;
    const adminRole = insertedRoles.find(r => r.name === "admin")!;
    const userRole = insertedRoles.find(r => r.name === "user")!;

    console.log("Seeding Permissions...");
    const insertedPermissions = await db
      .insert(permissions)
      .values([
        { name: "view:example", guard_name: "api" },
        { name: "create:example", guard_name: "api" },
        { name: "show:example", guard_name: "api" },
        { name: "update:example", guard_name: "api" },
        { name: "delete:example", guard_name: "api" },
      ])
      .returning({ id: permissions.id, name: permissions.name });

    const viewExample = insertedPermissions.find(p => p.name === "view:example")!;
    const createExample = insertedPermissions.find(p => p.name === "create:example")!;
    const showExample = insertedPermissions.find(p => p.name === "show:example")!;
    const updateExample = insertedPermissions.find(p => p.name === "update:example")!;
    const deleteExample = insertedPermissions.find(p => p.name === "delete:example")!;

    console.log("Seeding Role-Permissions...");
    await db.insert(roleHasPermissions).values([
      { role_id: superadminRole.id, permission_id: viewExample.id },
      { role_id: superadminRole.id, permission_id: createExample.id },
      { role_id: superadminRole.id, permission_id: showExample.id },
      { role_id: superadminRole.id, permission_id: updateExample.id },
      { role_id: superadminRole.id, permission_id: deleteExample.id },
    ]);

    console.log("Seeding Users...");
    const superadminID = uuidv4();
    const normalUserID = uuidv4();

    await db.insert(users).values([
      {
        id: superadminID,
        name: "Super Admin",
        email: "superadmin@mail.com",
        password: await bcrypt.hash("password", 10),
        status: "active",
      },
      {
        id: normalUserID,
        name: "Normal User",
        email: "user@mail.com",
        password: await bcrypt.hash("password", 10),
        status: "active",
      },
    ]);

    console.log("Seeding Model-Roles...");
    await db.insert(modelHasRoles).values([
      { role_id: superadminRole.id, model_type: "User", model_id: superadminID },
      { role_id: userRole.id, model_type: "User", model_id: normalUserID },
    ]);

    console.log("Seeding Model-Permissions...");
    await db.insert(modelHasPermissions).values([
      { permission_id: createExample.id, model_type: "User", model_id: superadminID },
    ]);

    console.log("✅ Seeding finished!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed().then(() => process.exit(0));
