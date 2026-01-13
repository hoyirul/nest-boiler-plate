/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/approval/domains/approval.entity.ts
 */

import { formatDate } from "@/shared/utils/parse";
class ApprovalStatus {
  id!: number;
  code!: string;
  label!: string;
  sort_order!: number;

  constructor(data: Partial<ApprovalStatus>) {
    this.id = data.id!;
    this.code = data.code!;
    this.label = data.label!;
    this.sort_order = data.sort_order!;
  }
}

export class ApprovalEntity {
  id!: number;
  model_type!: string;
  approver_id!: string;
  step!: number;
  status!: ApprovalStatus | null;
  remarks!: string | null;
  created_at!: string;
  updated_at!: string;
  deleted_at?: string | null;

  constructor(data: Partial<ApprovalEntity>) {
    this.id = data.id!;
    this.model_type = data.model_type!;
    this.approver_id = data.approver_id!;
    this.step = data.step!;
    this.status = data.status ? new ApprovalStatus(data.status) : null;
    this.remarks = data.remarks!;
    this.created_at = formatDate(data.created_at, 'datetime') ?? '';
    this.updated_at = formatDate(data.updated_at, 'datetime') ?? '';
    this.deleted_at = formatDate(data.deleted_at, 'datetime') ?? null;
  }

  static fromRows(rows: Partial<ApprovalEntity>[]): ApprovalEntity[] {
    return rows.map(r => new ApprovalEntity(r));
  }
}
