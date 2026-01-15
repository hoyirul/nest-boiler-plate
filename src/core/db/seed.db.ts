import { DefaultServer } from "@/core/db";
import { divisions } from "@/core/db/schema/division.schema";
import { departments } from "@/core/db/schema/department.schema";
import { positions } from "@/core/db/schema/position.schema";
import { users } from "@/core/db/schema/user.schema";
import { roles } from "@/core/db/schema/role.schema";
import { features } from "@/core/db/schema/feature.schema";
import { featurePermissions } from "./schema/feature-permission.schema";
import { examples } from "@/core/db/schema/example.schema";
import { statuses } from "@/core/db/schema/status.schema";
import { approvals } from "@/core/db/schema/approval.schema";
import { permissions } from "@/core/db/schema/permission.schema";
import { roleHasPermissions } from "@/core/db/schema/role-has-permissions.schema";
import { modelHasRoles } from "@/core/db/schema/model-has-roles.schema";
import { sql } from "drizzle-orm";
// import { modelHasPermissions } from "@/core/db/schema/model-has-permissions.schema";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { actions } from "./schema/action.schema";

async function seed() {
  const db = DefaultServer();

  try {
    await db.transaction(async (tx) => {
      console.log("Seeding Statuses...");
      const insertedStatuses = await tx
        .insert(statuses)
        .values([
          { code: "draft", label: "Draft", sort_order: 1 },
          { code: "submitted", label: "Submitted", sort_order: 2 },
          { code: "in-process", label: "In Process", sort_order: 3 },
          { code: "in-review", label: "In Review", sort_order: 4 },
          { code: "waiting-approval", label: "Waiting Approval", sort_order: 5 },
          { code: "approved", label: "Approved", sort_order: 6 },
          { code: "rejected", label: "Rejected", sort_order: 7 },
          { code: "canceled", label: "Canceled", sort_order: 8 },
        ])
        .returning({ id: statuses.id, code: statuses.code });
      
      const draftStatus = insertedStatuses.find(s => s.code === "draft")!;

      console.log("Seeding Actions...");
      const insertedActions = await tx
        .insert(actions)
        .values([
          { code: "submit", label: "Submit", sort_order: 1 },
          { code: "process", label: "Process", sort_order: 2 },
          { code: "review", label: "Review", sort_order: 3 },
          { code: "approve", label: "Approve", sort_order: 4 },
          { code: "reject", label: "Reject", sort_order: 5 },
          { code: "cancel", label: "Cancel", sort_order: 6 },
        ])
        .returning({ id: actions.id, code: actions.code });

      console.log("Seeding Examples...");
      // with foreach 10 data bulk insert
      await tx
        .insert(examples)
        .values(
          Array.from({ length: 10 }).map((_, i) => ({
            name: `Example ${i + 1}`,
            attachment: `examples/example_${i + 1}.png`,
            status_id: draftStatus.id,
          }))
        )
        .returning({ id: examples.id, name: examples.name });
      

      console.log("Seeding Roles...");
      const insertedRoles = await tx
        .insert(roles)
        .values([
          { name: "superadmin", guard_name: "api" },
          { name: "admin", guard_name: "api" },
          { name: "user", guard_name: "api" },
        ])
        .returning({ id: roles.id, name: roles.name });

      console.log("Seeding Division...");
      const insertedDivisions = await tx
        .insert(divisions)
        .values([
          { code: "DIV001", name: "IT", description: "Divisi Teknologi Informasi" },
          { code: "DIV002", name: "HRD", description: "Divisi Sumber Daya Manusia" },
          { code: "DIV003", name: "Finance", description: "Divisi Keuangan" },
        ])
        .returning({ id: divisions.id, name: divisions.name });

      console.log("Seeding Departments...");
      const insertedDepartments = await tx
        .insert(departments)
        .values([
          { code: "DPT001", division_id: insertedDivisions.find(d => d.name === "IT")!.id, name: "Development", description: "Departemen Pengembangan Perangkat Lunak" },
          { code: "DPT002", division_id: insertedDivisions.find(d => d.name === "IT")!.id, name: "Support", description: "Departemen Dukungan Teknis" },
          { code: "DPT003", division_id: insertedDivisions.find(d => d.name === "HRD")!.id, name: "Recruitment", description: "Departemen Rekrutmen Karyawan" },
          { code: "DPT004", division_id: insertedDivisions.find(d => d.name === "Finance")!.id, name: "Accounting", description: "Departemen Akuntansi" },
        ])
        .returning({ id: departments.id, name: departments.name });

      console.log("Seeding Positions...");
      const insertedPositions = await tx
        .insert(positions)
        .values([
          { code: "PST001", name: "Software Engineer", description: "Posisi untuk mengembangkan perangkat lunak" },
          { code: "PST002", name: "System Analyst", description: "Posisi untuk menganalisis sistem" },
          { code: "PST003", name: "HR Specialist", description: "Posisi untuk spesialisasi sumber daya manusia" },
          { code: "PST004", name: "Accountant", description: "Posisi untuk akuntan" },
        ])
        .returning({ id: positions.id, name: positions.name });

      const superadminRole = insertedRoles.find(r => r.name === "superadmin")!;
      const adminRole = insertedRoles.find(r => r.name === "admin")!;
      const userRole = insertedRoles.find(r => r.name === "user")!;

      console.log("Seeding Permissions...");
      const insertedPermissions = await tx
        .insert(permissions)
        .values([
          { name: "feat:user-management",    description: "Fitur terkait user management" },
          { name: "feat:organization",        description: "Fitur terkait organisasi" },

          { name: "feat:user-management:user", description: "Fitur terkait user" },
          { name: "view:user",                 description: "Lihat daftar atau profil user" },
          { name: "create:user",               description: "Membuat user baru" },
          { name: "show:user",                 description: "Lihat detail user tertentu" },
          { name: "update:user",               description: "Update data user secara umum" },
          { name: "update:user:status",        description: "Mengubah status aktif/nonaktif user" },
          { name: "update:user:password",      description: "Mengubah password user" },
          { name: "update:user:email",         description: "Mengubah email user" },
          
          { name: "feat:user-management:role", description: "Fitur terkait role" },
          { name: "view:role",                 description: "Melihat daftar role" },
          { name: "create:role",               description: "Membuat role baru" },
          { name: "show:role",                 description: "Melihat detail role tertentu" },
          { name: "update:role",               description: "Mengubah nama atau atribut role" },
          { name: "delete:role",               description: "Menghapus role" },
          { name: "restore:role",              description: "Mengembalikan role yang terhapus" },
          { name: "assign:role:user",          description: "Memberikan role ke user" },
          { name: "revoke:role:user",          description: "Mencabut role dari user" },

          { name: "feat:user-management:permission",           description: "Fitur terkait permission" },
          { name: "view:permission",           description: "Melihat daftar permission" },
          { name: "create:permission",         description: "Membuat permission baru" },
          { name: "show:permission",           description: "Melihat detail permission tertentu" },
          { name: "update:permission",         description: "Mengubah permission" },
          { name: "delete:permission",         description: "Menghapus permission" },
          { name: "restore:permission",        description: "Mengembalikan permission yang dihapus" },
          { name: "assign:permission:role",    description: "Memberikan permission ke role" },
          { name: "revoke:permission:role",    description: "Mencabut permission dari role" },
          { name: "assign:permission:user",    description: "Memberikan permission langsung ke user" },
          { name: "revoke:permission:user",    description: "Mencabut permission langsung dari user" },
          { name: "assign:permission:feature", description: "Memberikan permission ke feature" },
          { name: "revoke:permission:feature", description: "Mencabut permission dari feature" },

          { name: "feat:user-management:status", description: "Fitur terkait status" },
          { name: "view:status",                 description: "Melihat daftar status" },
          { name: "create:status",               description: "Membuat status baru" },
          { name: "show:status",                 description: "Melihat detail status tertentu" },
          { name: "update:status",               description: "Mengubah nama atau atribut status" },
          { name: "delete:status",               description: "Menghapus status" },
          { name: "restore:status",              description: "Mengembalikan status yang terhapus" },

          { name: "feat:user-management:feature", description: "Fitur terkait feature" },
          { name: "view:feature",                 description: "Melihat daftar feature" },
          { name: "create:feature",               description: "Membuat feature baru" },
          { name: "show:feature",                 description: "Melihat detail feature tertentu" },
          { name: "update:feature",               description: "Mengubah nama atau atribut feature" },
          { name: "delete:feature",               description: "Menghapus feature" },
          { name: "restore:feature",              description: "Mengembalikan feature yang terhapus" },

          { name: "feat:user-management:approval", description: "Fitur terkait approval" },
          { name: "view:approval",                 description: "Melihat daftar approval" },
          { name: "create:approval",               description: "Membuat approval baru" },
          { name: "show:approval",                 description: "Melihat detail approval tertentu" },
          { name: "update:approval",               description: "Mengubah nama atau atribut approval" },
          { name: "delete:approval",               description: "Menghapus approval" },
          { name: "restore:approval",              description: "Mengembalikan approval yang terhapus" },

          { name: "feat:example",              description: "Fitur terkait example" },
          { name: "view:example",              description: "Melihat daftar example" },
          { name: "create:example",            description: "Membuat example baru" },
          { name: "show:example",              description: "Melihat detail example tertentu" },
          { name: "update:example",            description: "Mengubah example" },
          { name: "delete:example",            description: "Menghapus example" },
          { name: "restore:example",           description: "Mengembalikan example yang dihapus" },
          { name: "approve:example",           description: "Menyetujui example" },

          { name: "feat:organization:division", description: "Fitur terkait division" },
          { name: "view:division",              description: "Melihat daftar division" },
          { name: "create:division",            description: "Membuat division baru" },
          { name: "show:division",              description: "Melihat detail division tertentu" },
          { name: "update:division",            description: "Mengubah division" },
          { name: "delete:division",            description: "Menghapus division" },
          { name: "restore:division",           description: "Mengembalikan division yang dihapus" },

          { name: "feat:organization:department", description: "Fitur terkait department" },
          { name: "view:department",              description: "Melihat daftar department" },
          { name: "create:department",            description: "Membuat department baru" },
          { name: "show:department",              description: "Melihat detail department tertentu" },
          { name: "update:department",            description: "Mengubah department" },
          { name: "delete:department",            description: "Menghapus department" },
          { name: "restore:department",           description: "Mengembalikan department yang dihapus" },

          { name: "feat:organization:position", description: "Fitur terkait position" },
          { name: "view:position",              description: "Melihat daftar position" },
          { name: "create:position",            description: "Membuat position baru" },
          { name: "show:position",              description: "Melihat detail position tertentu" },
          { name: "update:position",            description: "Mengubah position" },
          { name: "delete:position",            description: "Menghapus position" },
          { name: "restore:position",           description: "Mengembalikan position yang dihapus" },
        ])
        .returning({ id: permissions.id, name: permissions.name });

      
      console.log("Seeding Role-Permissions (Super Admin)...");

      await tx.insert(roleHasPermissions).values(
        insertedPermissions.map(p => ({
          role_id: superadminRole.id,
          permission_id: p.id,
        }))
      );

      console.log("Seeding Users...");
      const superadminID = uuidv4();
      const normalUserID = uuidv4();

      await tx.insert(users).values([
        {
          id: superadminID,
          division_id: insertedDivisions.find(d => d.name === "IT")!.id,
          department_id: insertedDepartments.find(d => d.name === "Development")!.id,
          position_id: insertedPositions.find(p => p.name === "Software Engineer")!.id,
          name: "Super Admin",
          email: "superadmin@mail.com",
          password: await bcrypt.hash("password", 10),
          status: "active",
        },
        {
          id: normalUserID,
          division_id: insertedDivisions.find(d => d.name === "IT")!.id,
          department_id: insertedDepartments.find(d => d.name === "Support")!.id,
          position_id: insertedPositions.find(p => p.name === "Software Engineer")!.id,
          name: "Normal User",
          email: "user@mail.com",
          password: await bcrypt.hash("password", 10),
          status: "active",
        },
      ]);

      console.log("Seeding Model-Roles...");
      await tx.insert(modelHasRoles).values([
        { role_id: superadminRole.id, model_type: "User", model_id: superadminID },
        { role_id: userRole.id, model_type: "User", model_id: normalUserID },
      ]);

      // console.log("Seeding Model-Permissions...");
      // await tx.insert(modelHasPermissions).values([
      //   // just for demonstration, give normal user the permission to view example
      // ]);

      // Insert children features with correct parent_id
      console.log("Seeding Features...");

      const insertedFeatures = await tx.insert(features).values([
        // ROOT GROUP
        {
          code: "user-management",
          name: "User Management",
          route_path: "/user-management",
          icon: "UserCog",
          sort_order: 1,
          is_active: true,
        },
        {
          code: "organization",
          name: "Organization",
          route_path: "/organization",
          icon: "Database",
          sort_order: 2,
          is_active: true,
        },

        // USER MANAGEMENT CHILDREN
        {
          parent_id: 1,
          code: "user",
          name: "Users",
          route_path: "/user-management/users",
          icon: "User",
          sort_order: 1,
          is_active: true,
        },
        {
          parent_id: 1,
          code: "role",
          name: "Roles",
          route_path: "/user-management/roles",
          icon: "Shield",
          sort_order: 2,
          is_active: true,
        },
        {
          parent_id: 1,
          code: "permission",
          name: "Permissions",
          route_path: "/user-management/permissions",
          icon: "Key",
          sort_order: 3,
          is_active: true,
        },
        {
          parent_id: 1,
          code: "status",
          name: "Statuses",
          route_path: "/user-management/statuses",
          icon: "Tag",
          sort_order: 4,
          is_active: true,
        },
        {
          parent_id: 1,
          code: "feature",
          name: "Features",
          route_path: "/user-management/features",
          icon: "List",
          sort_order: 5,
          is_active: true,
        },
        {
          parent_id: 1,
          code: "approval",
          name: "Approvals",
          route_path: "/user-management/approvals",
          icon: "CheckCircle",
          sort_order: 6,
          is_active: true,
        },

        // MASTER DATA CHILDREN
        {
          parent_id: 2,
          code: "division",
          name: "Divisions",
          route_path: "/organization/divisions",
          icon: "Building",
          sort_order: 1,
          is_active: true,
        },
        {
          parent_id: 2,
          code: "department",
          name: "Departments",
          route_path: "/organization/departments",
          icon: "Layers",
          sort_order: 2,
          is_active: true,
        },
        {
          parent_id: 2,
          code: "position",
          name: "Positions",
          route_path: "/organization/positions",
          icon: "UserTag",
          sort_order: 3,
          is_active: true,
        },
      ]).returning({ id: features.id, code: features.code });

      function feat(code: string) {
        return insertedFeatures.find(f => f.code === code)!.id;
      }

      function perm(name: string) {
        console.log("Looking for permission:", name);
        return insertedPermissions.find(p => p.name === name)!.id;
      }

      console.log("Seeding Feature-Permissions...");

      await tx.insert(featurePermissions).values([
        // === USER MANAGEMENT ROOT ===
        { feature_id: feat("user-management"), permission_id: perm("feat:user-management") },

        // USERS
        { feature_id: feat("user"), permission_id: perm("feat:user-management") },
        { feature_id: feat("user"), permission_id: perm("feat:user-management:user") },

        // ROLES
        { feature_id: feat("role"), permission_id: perm("feat:user-management") },
        { feature_id: feat("role"), permission_id: perm("feat:user-management:role") },

        // PERMISSIONS
        { feature_id: feat("permission"), permission_id: perm("feat:user-management") },
        { feature_id: feat("permission"), permission_id: perm("feat:user-management:permission") },

        // FEATURES
        { feature_id: feat("feature"), permission_id: perm("feat:user-management") },
        { feature_id: feat("feature"), permission_id: perm("feat:user-management:feature") },
        
        // STATUS
        { feature_id: feat("status"), permission_id: perm("feat:user-management") },
        { feature_id: feat("status"), permission_id: perm("feat:user-management:status") },

        // APPROVALS
        { feature_id: feat("approval"), permission_id: perm("feat:user-management") },
        { feature_id: feat("approval"), permission_id: perm("feat:user-management:approval") },

        // === ORGANIZATION ===
        { feature_id: feat("organization"), permission_id: perm("feat:organization") },

        // DIVISION
        { feature_id: feat("division"), permission_id: perm("feat:organization") },
        { feature_id: feat("division"), permission_id: perm("feat:organization:division") },

        // DEPARTMENT
        { feature_id: feat("department"), permission_id: perm("feat:organization") },
        { feature_id: feat("department"), permission_id: perm("feat:organization:department") },

        // POSITION
        { feature_id: feat("position"), permission_id: perm("feat:organization") },
        { feature_id: feat("position"), permission_id: perm("feat:organization:position") },
      ]);


      console.log("Seeding Approvals...");
      await tx.insert(approvals).values([
        {
          model_type: "examples",
          approver_id: superadminID,
          step: 1,
          action_id: insertedActions.find(a => a.code === "submit")!.id,
          remarks: null,
        },
        {
          model_type: "examples",
          approver_id: superadminID,
          step: 2,
          action_id: insertedActions.find(a => a.code === "approve")!.id,
          remarks: null,
        },
      ]);

      console.log("✅ Seeding finished!");
    });
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed().then(() => process.exit(0));
