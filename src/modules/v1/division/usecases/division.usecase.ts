/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/division/usecases/division.usecase.ts
 */

import { DivisionRepository } from "@/modules/v1/division/repositories/division.repository";
import { CreateDivisionDTO, UpdateDivisionDTO } from "@/modules/v1/division/domains/division.types";
import { NotFoundError, ValidationError } from "@/shared/utils/errors";
import { buildPaginationMeta } from "@/shared/utils/pagination";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DivisionUseCase {
  constructor(private readonly repo: DivisionRepository) {}

  async create(payload: CreateDivisionDTO) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.create>> => {
      const isExist = await this.repo.isExist(payload.name);
      if (isExist) {
        throw ValidationError("api.common.validation_failed", {
          name: "api.modules.division.already_exists",
        });
      }

      return this.repo.create(payload, tx);
    });
  }

  async list(page: number, perPage: number, keywords: string, filters?: Record<string, string>) {
    const offset = (page - 1) * perPage;
    const { data, total } = await this.repo.findAll(perPage, offset, keywords, filters);

    return {
      items: data,
      pagination: buildPaginationMeta(page, perPage, total),
    };
  }

  async detail(id: number) {
    const item = await this.repo.findById(id);
    if (!item) {
      throw NotFoundError("api.modules.division.not_found");
    }
    return item;
  }

  async update(id: number, payload: UpdateDivisionDTO) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.update>> => {
      const item = await this.repo.findById(id);
      if (!item) {
        throw NotFoundError("api.modules.division.not_found");
      }

      return this.repo.update(id, payload, tx);
    });
  }

  async delete(id: number) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.delete>> => {
      const item = await this.repo.findById(id);
      if (!item) {
        throw NotFoundError("api.modules.division.not_found");
      }

      return this.repo.delete(id, tx);
    });
  }

  async restore(id: number) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.restore>> => {
      const item = await this.repo.findById(id, true);
      if (!item) {
        throw NotFoundError("api.modules.division.not_found");
      }
      
      return this.repo.restore(id, tx);
    });
  }
}
