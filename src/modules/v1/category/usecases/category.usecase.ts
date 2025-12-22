import { CategoryRepository } from "@/modules/v1/category/repositories/category.repository";
import { CreateCategoryDTO, UpdateCategoryDTO } from "@/modules/v1/category/domains/category.types";
import { NotFoundError } from "@/shared/utils/errors";
import { buildPaginationMeta } from "@/shared/utils/pagination";

export class CategoryUseCase {
  constructor(private readonly repo = new CategoryRepository()) {}

  async create(payload: CreateCategoryDTO) {
    return this.repo.create(payload);
  }

  async list(page: number, perPage: number) {
    const offset = (page - 1) * perPage;
    const { data, total } = await this.repo.findAll(perPage, offset);

    return {
      items: data,
      pagination: buildPaginationMeta(page, perPage, total),
    };
  }

  async detail(id: number) {
    const category = await this.repo.findById(id);
    if (!category) {
      throw NotFoundError("api.modules.category.not_found");
    }
    return category;
  }

  async update(id: number, payload: UpdateCategoryDTO) {
    const updated = await this.repo.update(id, payload);
    if (!updated) {
      throw NotFoundError("api.modules.category.not_found");
    }
    return updated;
  }

  async delete(id: number) {
    const category = await this.repo.findById(id);
    if (!category) {
      throw NotFoundError("api.modules.category.not_found");
    }

    await this.repo.delete(id);
    return { success: true };
  }
}
