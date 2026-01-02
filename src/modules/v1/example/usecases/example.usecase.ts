import { ExampleRepository } from "@/modules/v1/example/repositories/example.repository";
import { CreateExampleDTO, UpdateExampleDTO } from "@/modules/v1/example/domains/example.types";
import { NotFoundError } from "@/shared/utils/errors";
import { buildPaginationMeta } from "@/shared/utils/pagination";

export class ExampleUseCase {
  constructor(private readonly repo = new ExampleRepository()) {}

  async create(payload: CreateExampleDTO) {
    return this.repo.create(payload);
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
    const updated = await this.repo.update(id, payload);
    if (!updated) {
      throw NotFoundError("api.modules.example.not_found");
    }
    return updated;
  }

  async delete(id: number) {
    const example = await this.repo.findById(id);
    if (!example) {
      throw NotFoundError("api.modules.example.not_found");
    }

    await this.repo.delete(id);
    return { success: true };
  }
}
