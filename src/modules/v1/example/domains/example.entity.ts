import { formatDate } from "@/shared/utils/parse";
import { storageUrl } from "@/core/config/storage";

class ExampleStatus {
  id!: number;
  code!: string;
  label!: string;
  sort_order!: number;

  constructor(data: Partial<ExampleStatus>) {
    this.id = data.id!;
    this.code = data.code!;
    this.label = data.label!;
    this.sort_order = data.sort_order!;
  }
}

export class ExampleEntity {
  id!: number;
  name!: string;
  attachment?: string | null;
  status: ExampleStatus | null;
  created_at!: string;
  updated_at!: string;
  deleted_at?: string | null;

  constructor(data: Partial<ExampleEntity>) {
    this.id = data.id!;
    this.name = data.name ?? '';
    this.attachment = storageUrl(data.attachment ?? '') ?? null;
    this.status = data.status ? new ExampleStatus(data.status) : null;
    this.created_at = formatDate(data.created_at, 'datetime') ?? '';
    this.updated_at = formatDate(data.updated_at, 'datetime') ?? '';
    this.deleted_at = formatDate(data.deleted_at, 'datetime') ?? null;
  }

  static fromRows(rows: Partial<ExampleEntity>[]): ExampleEntity[] {
    return rows.map(r => new ExampleEntity(r));
  }
}
