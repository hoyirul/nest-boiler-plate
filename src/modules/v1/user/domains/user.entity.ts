// division, department, position

export class DivisionEntity {
  id!: string;
  name!: string;
  description!: string;

  constructor(data: Partial<DivisionEntity>) {
    Object.assign(this, data);
  }
}

export class DepartmentEntity {
  id!: string;
  name!: string;
  description!: string;

  constructor(data: Partial<DepartmentEntity>) {
    Object.assign(this, data);
  }
}

export class PositionEntity {
  id!: string;
  name!: string;
  description!: string;

  constructor(data: Partial<PositionEntity>) {
    Object.assign(this, data);
  }
}

export class UserEntity {
  id!: string;
  division?: DivisionEntity | null;
  department?: DepartmentEntity | null;
  position?: PositionEntity | null;
  name!: string;
  email!: string;
  status!: string;
  created_at!: Date;
  updated_at!: Date;
  deleted_at?: Date | null;

  constructor(data: Partial<UserEntity>) {
    Object.assign(this, data);
  }
}
