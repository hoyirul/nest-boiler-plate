
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

export class AuthEntity {
  id: string;
  name: string;
  email: string;
  password!: string;
  status: string;
  roles: string[];
  permissions: string[];
  created_at: Date;
  updated_at: Date;

  constructor(partial: Partial<AuthEntity>) {
    Object.assign(this, {
      roles: [],
      permissions: [],
      ...partial,
    });
  }


  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  activate() {
    this.status = UserStatus.ACTIVE;
  }

  deactivate() {
    this.status = UserStatus.INACTIVE;
  }

  ban() {
    this.status = UserStatus.BANNED;
  }
}
