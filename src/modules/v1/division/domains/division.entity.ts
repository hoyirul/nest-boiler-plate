/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/division/domains/division.entity.ts
 */

export class DivisionEntity {
  id!: string;
  code!: string;
  name!: string;
  description!: string;
  created_at!: Date;
  updated_at!: Date;
  deleted_at?: Date | null;

  constructor(data: Partial<DivisionEntity>) {
    Object.assign(this, data);
  }
}
