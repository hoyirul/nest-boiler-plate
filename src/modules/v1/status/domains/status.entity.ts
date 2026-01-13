/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/status/domains/status.entity.ts
 */

import { formatDate } from "@/shared/utils/parse";
export class StatusEntity {
  id!: number;
  code!: string;
  label!: string;
  sort_order!: number;
  created_at!: string;
  updated_at!: string;
  deleted_at?: string | null;

  constructor(data: Partial<StatusEntity>) {
    this.id = data.id!;
    this.code = data.code!;
    this.label = data.label!;
    this.sort_order = data.sort_order!;
    this.created_at = formatDate(data.created_at, 'datetime') ?? '';
    this.updated_at = formatDate(data.updated_at, 'datetime') ?? '';
    this.deleted_at = formatDate(data.deleted_at, 'datetime') ?? null;
  }

  static fromRows(rows: Partial<StatusEntity>[]): StatusEntity[] {
    return rows.map(r => new StatusEntity(r));
  }
}
