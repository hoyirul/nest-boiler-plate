/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/department/department.module.ts
 */

import { Module } from "@nestjs/common";
import { DepartmentController } from "./controllers/department.controller";
import { DepartmentUseCase } from "./usecases/department.usecase";
import { DepartmentRepository } from "./repositories/department.repository";
import { AuthModule } from "@/modules/v1/auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [DepartmentController],
  providers: [
    DepartmentUseCase, 
    DepartmentRepository
  ],
})
export class DepartmentModule {}
