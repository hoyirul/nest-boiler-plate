import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/v1/auth/auth.module';
import { UserModule } from '@/modules/v1/user/user.module';
import { RoleModule } from '@/modules/v1/role/role.module';
import { PermissionModule } from '@/modules/v1/permission/permission.module';
import { DivisionModule } from '@/modules/v1/division/division.module';
import { DepartmentModule } from '@/modules/v1/department/department.module';
import { PositionModule } from '@/modules/v1/position/position.module';
import { ExampleModule } from '@/modules/v1/example/example.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    RoleModule,
    PermissionModule,
    DivisionModule,
    DepartmentModule,
    PositionModule,
    ExampleModule,
  ],
})

export class V1Module {}
