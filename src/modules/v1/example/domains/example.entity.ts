import { formatDate } from "@/shared/utils/parse";
import { storageUrl } from "@/core/config/storage";
export class ExampleEntity {
  id!: number;
  name!: string;
  attachment?: string | null;
  created_at!: string;
  updated_at!: string;
  deleted_at?: string | null;

  constructor(data: Partial<ExampleEntity>) {
    this.id = data.id!;
    this.name = data.name ?? '';
    this.attachment = storageUrl(data.attachment ?? '') ?? null;
    this.created_at = formatDate(data.created_at, 'datetime') ?? '';
    this.updated_at = formatDate(data.updated_at, 'datetime') ?? '';
    this.deleted_at = formatDate(data.deleted_at, 'datetime') ?? null;
  }

  static fromRows(rows: Partial<ExampleEntity>[]): ExampleEntity[] {
    return rows.map(r => new ExampleEntity(r));
  }
}
