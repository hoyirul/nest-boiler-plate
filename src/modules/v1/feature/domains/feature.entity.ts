/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/feature/domains/feature.entity.ts
 */

import { formatDate } from "@/shared/utils/parse";
export class FeatureEntity {
  id!: number;
  parent_id!: number | null;
  code!: string;
  name!: string;
  route_path!: string;
  icon!: string;
  sort_order!: number;
  is_active!: boolean;
  created_at!: string;
  updated_at!: string;
  deleted_at?: string | null;

  constructor(data: Partial<FeatureEntity>) {
    this.id = data.id!;
    this.parent_id = data.parent_id!;
    this.code = data.code!;
    this.name = data.name!;
    this.route_path = data.route_path!;
    this.icon = data.icon!;
    this.sort_order = data.sort_order!;
    this.is_active = data.is_active!;
    this.created_at = formatDate(data.created_at, 'datetime') ?? '';
    this.updated_at = formatDate(data.updated_at, 'datetime') ?? '';
    this.deleted_at = formatDate(data.deleted_at, 'datetime') ?? null;
  }

  static fromRows(rows: Partial<FeatureEntity>[]): FeatureEntity[] {
    return rows.map(r => new FeatureEntity(r));
  }
}
