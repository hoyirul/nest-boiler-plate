export class CategoryEntity {
  id!: number;
  name!: string;
  created_at!: Date;
  updated_at!: Date;

  constructor(data: Partial<CategoryEntity>) {
    Object.assign(this, data);
  }
}
