--CREATE TYPE "public"."status" AS ENUM('active', 'inactive', 'banned');--> statement-breakpoint
CREATE TABLE "mst_departments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"division_id" bigserial NOT NULL,
	"code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(255) DEFAULT null,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp DEFAULT null,
	CONSTRAINT "mst_departments_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "mst_divisions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(255) DEFAULT null,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp DEFAULT null,
	CONSTRAINT "mst_divisions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "examples" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"attachment" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE "rel_model_has_permissions" (
	"permission_id" bigint NOT NULL,
	"model_type" varchar(100) NOT NULL,
	"model_id" varchar(36) NOT NULL,
	CONSTRAINT "model_has_permissions_pk" PRIMARY KEY("permission_id","model_type","model_id")
);
--> statement-breakpoint
CREATE TABLE "rel_model_has_roles" (
	"role_id" bigint NOT NULL,
	"model_type" varchar(100) NOT NULL,
	"model_id" varchar(36) NOT NULL,
	CONSTRAINT "model_has_roles_pk" PRIMARY KEY("role_id","model_type","model_id")
);
--> statement-breakpoint
CREATE TABLE "mst_permissions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text DEFAULT null,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE "mst_positions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(255) DEFAULT null,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE "rel_role_has_permissions" (
	"role_id" bigint NOT NULL,
	"permission_id" bigint NOT NULL,
	CONSTRAINT "role_has_permissions_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "mst_roles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"guard_name" varchar(100) DEFAULT 'api',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE "mst_users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"division_id" bigserial NOT NULL,
	"department_id" bigserial NOT NULL,
	"position_id" bigserial NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"status" "status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mst_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "mst_departments" ADD CONSTRAINT "mst_departments_division_id_mst_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."mst_divisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rel_model_has_permissions" ADD CONSTRAINT "rel_model_has_permissions_permission_id_mst_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."mst_permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rel_model_has_roles" ADD CONSTRAINT "rel_model_has_roles_role_id_mst_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."mst_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rel_role_has_permissions" ADD CONSTRAINT "rel_role_has_permissions_role_id_mst_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."mst_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rel_role_has_permissions" ADD CONSTRAINT "rel_role_has_permissions_permission_id_mst_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."mst_permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mst_users" ADD CONSTRAINT "mst_users_division_id_mst_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."mst_divisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mst_users" ADD CONSTRAINT "mst_users_department_id_mst_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."mst_departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mst_users" ADD CONSTRAINT "mst_users_position_id_mst_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."mst_positions"("id") ON DELETE cascade ON UPDATE no action;