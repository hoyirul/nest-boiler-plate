export class ExampleEntity {
  id!: number;
  name!: string;
  attachment?: string | null;
  created_at!: Date;
  updated_at!: Date;
  deleted_at?: Date | null;

  constructor(data: Partial<ExampleEntity>) {
    Object.assign(this, data);
  }
}
