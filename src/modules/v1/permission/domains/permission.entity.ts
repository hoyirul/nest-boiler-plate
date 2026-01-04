export class PermissionEntity {
  id!: number;
  name!: string;
  created_at!: Date;
  updated_at!: Date;
  deleted_at?: Date | null;

  constructor(data: Partial<PermissionEntity>) {
    Object.assign(this, data);
  }
}
