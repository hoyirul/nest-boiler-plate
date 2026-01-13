--CREATE TYPE "public"."status" AS ENUM('active', 'inactive', 'banned');--> statement-breakpoint
CREATE TABLE "mst_actions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	"label" varchar(50) NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE "trx_approval_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"approval_id" bigint NOT NULL,
	"model_type" varchar(100) NOT NULL,
	"model_id" varchar(36) NOT NULL,
	"status_from" bigint NOT NULL,
	"status_to" bigint NOT NULL,
	"action_id" bigint,
	"changed_by" varchar(36) NOT NULL,
	"note" varchar(255) DEFAULT null,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trx_approvals" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"model_type" varchar(100) NOT NULL,
	"approver_id" varchar(36) NOT NULL,
	"step" integer NOT NULL,
	"action_id" bigint NOT NULL,
	"remarks" varchar(255) DEFAULT null,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp DEFAULT null
);
--> statement-breakpoint
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
	"status_id" bigint DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp DEFAULT null
);
--> statement-breakpoint
CREATE TABLE "rel_feature_permissions" (
	"feature_id" bigint NOT NULL,
	"permission_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mst_features" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"parent_id" bigint DEFAULT null,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"route_path" varchar(255) NOT NULL,
	"icon" varchar(50) NOT NULL,
	"sort_order" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
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
CREATE TABLE "mst_statuses" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"label" varchar(100) NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
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
ALTER TABLE "trx_approval_logs" ADD CONSTRAINT "trx_approval_logs_approval_id_trx_approvals_id_fk" FOREIGN KEY ("approval_id") REFERENCES "public"."trx_approvals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trx_approval_logs" ADD CONSTRAINT "trx_approval_logs_status_from_mst_statuses_id_fk" FOREIGN KEY ("status_from") REFERENCES "public"."mst_statuses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trx_approval_logs" ADD CONSTRAINT "trx_approval_logs_status_to_mst_statuses_id_fk" FOREIGN KEY ("status_to") REFERENCES "public"."mst_statuses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trx_approval_logs" ADD CONSTRAINT "trx_approval_logs_action_id_mst_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."mst_actions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trx_approvals" ADD CONSTRAINT "trx_approvals_action_id_mst_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."mst_actions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mst_departments" ADD CONSTRAINT "mst_departments_division_id_mst_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."mst_divisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "examples" ADD CONSTRAINT "examples_status_id_mst_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."mst_statuses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rel_feature_permissions" ADD CONSTRAINT "rel_feature_permissions_feature_id_mst_features_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."mst_features"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rel_feature_permissions" ADD CONSTRAINT "rel_feature_permissions_permission_id_mst_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."mst_permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rel_model_has_permissions" ADD CONSTRAINT "rel_model_has_permissions_permission_id_mst_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."mst_permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rel_model_has_roles" ADD CONSTRAINT "rel_model_has_roles_role_id_mst_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."mst_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rel_role_has_permissions" ADD CONSTRAINT "rel_role_has_permissions_role_id_mst_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."mst_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rel_role_has_permissions" ADD CONSTRAINT "rel_role_has_permissions_permission_id_mst_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."mst_permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mst_users" ADD CONSTRAINT "mst_users_division_id_mst_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."mst_divisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mst_users" ADD CONSTRAINT "mst_users_department_id_mst_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."mst_departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mst_users" ADD CONSTRAINT "mst_users_position_id_mst_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."mst_positions"("id") ON DELETE cascade ON UPDATE no action;