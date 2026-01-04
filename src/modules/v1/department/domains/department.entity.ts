/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/department/domains/department.entity.ts
 */

export class DepartmentEntity {
  id!: string;
  code!: string;
  divisions_id!: string;
  name!: string;
  description!: string;
  created_at!: Date;
  updated_at!: Date;
  deleted_at?: Date | null;

  constructor(data: Partial<DepartmentEntity>) {
    Object.assign(this, data);
  }
}
