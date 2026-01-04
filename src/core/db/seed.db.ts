import { DefaultServer } from "@/core/db";
import { divisions } from "@/core/db/schema/division.schema";
import { departments } from "@/core/db/schema/department.schema";
import { positions } from "@/core/db/schema/position.schema";
import { users } from "@/core/db/schema/user.schema";
import { roles } from "@/core/db/schema/role.schema";
import { permissions } from "@/core/db/schema/permission.schema";
import { roleHasPermissions } from "@/core/db/schema/role-has-permissions.schema";
import { modelHasRoles } from "@/core/db/schema/model-has-roles.schema";
// import { modelHasPermissions } from "@/core/db/schema/model-has-permissions.schema";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  const db = DefaultServer();

  try {
    console.log("Seeding Roles...");
    const insertedRoles = await db
      .insert(roles)
      .values([
        { name: "superadmin", guard_name: "api" },
        { name: "admin", guard_name: "api" },
        { name: "user", guard_name: "api" },
      ])
      .returning({ id: roles.id, name: roles.name });

    console.log("Seeding Division...");
    const insertedDivisions = await db
      .insert(divisions)
      .values([
        { code: "DIV001", name: "IT", description: "Divisi Teknologi Informasi" },
        { code: "DIV002", name: "HRD", description: "Divisi Sumber Daya Manusia" },
        { code: "DIV003", name: "Finance", description: "Divisi Keuangan" },
      ])
      .returning({ id: divisions.id, name: divisions.name });

    console.log("Seeding Departments...");
    const insertedDepartments = await db
      .insert(departments)
      .values([
        { code: "DPT001", division_id: insertedDivisions.find(d => d.name === "IT")!.id, name: "Development", description: "Departemen Pengembangan Perangkat Lunak" },
        { code: "DPT002", division_id: insertedDivisions.find(d => d.name === "IT")!.id, name: "Support", description: "Departemen Dukungan Teknis" },
        { code: "DPT003", division_id: insertedDivisions.find(d => d.name === "HRD")!.id, name: "Recruitment", description: "Departemen Rekrutmen Karyawan" },
        { code: "DPT004", division_id: insertedDivisions.find(d => d.name === "Finance")!.id, name: "Accounting", description: "Departemen Akuntansi" },
      ])
      .returning({ id: departments.id, name: departments.name });

    console.log("Seeding Positions...");
    const insertedPositions = await db
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
    const insertedPermissions = await db
      .insert(permissions)
      .values([
        { name: "view:user",                 description: "Lihat daftar atau profil user" },
        { name: "create:user",               description: "Membuat user baru" },
        { name: "show:user",                 description: "Lihat detail user tertentu" },
        { name: "update:user",               description: "Update data user secara umum" },
        { name: "update:user:status",        description: "Mengubah status aktif/nonaktif user" },
        { name: "update:user:password",      description: "Mengubah password user" },
        { name: "update:user:email",         description: "Mengubah email user" },

        { name: "view:role",                 description: "Melihat daftar role" },
        { name: "create:role",               description: "Membuat role baru" },
        { name: "show:role",                 description: "Melihat detail role tertentu" },
        { name: "update:role",               description: "Mengubah nama atau atribut role" },
        { name: "delete:role",               description: "Menghapus role" },
        { name: "restore:role",              description: "Mengembalikan role yang terhapus" },
        { name: "assign:role:user",          description: "Memberikan role ke user" },
        { name: "revoke:role:user",          description: "Mencabut role dari user" },

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

        { name: "view:example",              description: "Melihat daftar example" },
        { name: "create:example",            description: "Membuat example baru" },
        { name: "show:example",              description: "Melihat detail example tertentu" },
        { name: "update:example",            description: "Mengubah example" },
        { name: "delete:example",            description: "Menghapus example" },
        { name: "restore:example",           description: "Mengembalikan example yang dihapus" },

        { name: "view:division",              description: "Melihat daftar division" },
        { name: "create:division",            description: "Membuat division baru" },
        { name: "show:division",              description: "Melihat detail division tertentu" },
        { name: "update:division",            description: "Mengubah division" },
        { name: "delete:division",            description: "Menghapus division" },
        { name: "restore:division",           description: "Mengembalikan division yang dihapus" },

        { name: "view:department",              description: "Melihat daftar department" },
        { name: "create:department",            description: "Membuat department baru" },
        { name: "show:department",              description: "Melihat detail department tertentu" },
        { name: "update:department",            description: "Mengubah department" },
        { name: "delete:department",            description: "Menghapus department" },
        { name: "restore:department",           description: "Mengembalikan department yang dihapus" },

        { name: "view:position",              description: "Melihat daftar position" },
        { name: "create:position",            description: "Membuat position baru" },
        { name: "show:position",              description: "Melihat detail position tertentu" },
        { name: "update:position",            description: "Mengubah position" },
        { name: "delete:position",            description: "Menghapus position" },
        { name: "restore:position",           description: "Mengembalikan position yang dihapus" },
      ])
      .returning({ id: permissions.id, name: permissions.name });

    
    console.log("Seeding Role-Permissions (Super Admin)...");

    await db.insert(roleHasPermissions).values(
      insertedPermissions.map(p => ({
        role_id: superadminRole.id,
        permission_id: p.id,
      }))
    );

    console.log("Seeding Users...");
    const superadminID = uuidv4();
    const normalUserID = uuidv4();

    await db.insert(users).values([
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
    await db.insert(modelHasRoles).values([
      { role_id: superadminRole.id, model_type: "User", model_id: superadminID },
      { role_id: userRole.id, model_type: "User", model_id: normalUserID },
    ]);

    // console.log("Seeding Model-Permissions...");
    // await db.insert(modelHasPermissions).values([
    //   // just for demonstration, give normal user the permission to view example
    // ]);

    console.log("✅ Seeding finished!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed().then(() => process.exit(0));
