export class AuthEntity {
  id!: number;
  name!: string;
  email!: string;
  password!: string;
  status!: 'active' | 'inactive' | 'banned';
  created_at!: Date;
  updated_at!: Date;

  constructor(data: Partial<AuthEntity>) {
    Object.assign(this, data);
  }
}
