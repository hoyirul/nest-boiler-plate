export class RoleEntity {
  id!: number;
  name!: string;
  guard_name!: string;
  created_at!: Date;
  updated_at!: Date;
  deleted_at?: Date | null;

  constructor(data: Partial<RoleEntity>) {
    Object.assign(this, data);
  }
}
