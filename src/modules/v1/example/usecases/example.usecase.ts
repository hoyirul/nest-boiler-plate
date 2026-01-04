import { ExampleRepository } from "@/modules/v1/example/repositories/example.repository";
import { CreateExampleDTO, UpdateExampleDTO } from "@/modules/v1/example/domains/example.types";
import { NotFoundError, ValidationError } from "@/shared/utils/errors";
import { buildPaginationMeta } from "@/shared/utils/pagination";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ExampleUseCase {
  constructor(private readonly repo: ExampleRepository) {}

  async create(payload: CreateExampleDTO) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.create>> => {
      const isExist: boolean = await this.repo.isExist(payload.name);
      if (isExist) {
        throw ValidationError("api.common.validation_failed", {
          name: "api.modules.example.already_exists",
        });
      }

      return this.repo.create(payload, tx);
    });
  }

  async list(page: number, perPage: number, keywords: string, filters?: Record<string, string> ) {
    const offset = (page - 1) * perPage;
    const { data, total } = await this.repo.findAll(perPage, offset, keywords, filters);

    return {
      items: data,
      pagination: buildPaginationMeta(page, perPage, total),
    };
  }

  async detail(id: number) {
    const example = await this.repo.findById(id);
    if (!example) {
      throw NotFoundError("api.modules.example.not_found");
    }
    return example;
  }

  async update(id: number, payload: UpdateExampleDTO) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.update>> => {
      const example = await this.repo.findById(id);
      if (!example) {
        throw NotFoundError("api.modules.example.not_found");
      }

      if (payload.name && payload.name.toLowerCase() !== example.name) {
        const isExist: boolean = await this.repo.isExist(payload.name);
        if (isExist) {
          throw ValidationError("api.common.validation_failed", {
            name: "api.modules.example.already_exists",
          });
        }
      }

      return this.repo.update(id, payload, tx);
    });
  }

  async delete(id: number) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.delete>> => {
      const example = await this.repo.findById(id);
      if (!example) {
        throw NotFoundError("api.modules.example.not_found");
      }

      return await this.repo.delete(id, tx);
    });
  }

  async restore(id: number) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.restore>> => {
      const item = await this.repo.findById(id, true);
      if (!item) {
        throw NotFoundError("api.modules.example.not_found");
      }

      return await this.repo.restore(id, tx);
    });
  }
}
