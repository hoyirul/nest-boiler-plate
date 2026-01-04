/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/position/domains/position.entity.ts
 */

export class PositionEntity {
  id!: number;
  code!: string;
  name!: string;
  description!: string;
  created_at!: Date;
  updated_at!: Date;
  deleted_at?: Date | null;

  constructor(data: Partial<PositionEntity>) {
    Object.assign(this, data);
  }
}
