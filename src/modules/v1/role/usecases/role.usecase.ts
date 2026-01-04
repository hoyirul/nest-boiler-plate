import { RoleRepository } from "@/modules/v1/role/repositories/role.repository";
import { 
  CreateRoleDTO, 
  UpdateRoleDTO, 
  AssignRoleDTO, 
  RevokeRoleDTO 
} from "@/modules/v1/role/domains/role.types";
import { NotFoundError, ValidationError } from "@/shared/utils/errors";
import { buildPaginationMeta } from "@/shared/utils/pagination";
import { RedisCache } from "@/shared/redis/cache.redis";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RoleUseCase {
  constructor(
    private readonly repo: RoleRepository,
    private readonly redis: RedisCache
  ) {}

  async create(payload: CreateRoleDTO) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.create>> => {
      const isExist: boolean = await this.repo.isExist(payload.name);
      if (isExist) {
        throw ValidationError("api.common.validation_failed", {
          name: "api.modules.role.already_exists",
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
    const role = await this.repo.findById(id);
    if (!role) {
      throw NotFoundError("api.modules.role.not_found");
    }
    return role;
  }

  async update(id: number, payload: UpdateRoleDTO) {
    const db = await this.repo.getExecutor();
    
    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.update>> => {
      const role = await this.repo.findById(id);
      if (!role) {
        throw NotFoundError("api.modules.role.not_found");
      }

      if (payload.name && payload.name.toLowerCase() !== role.name) {
        const isExist: boolean = await this.repo.isExist(payload.name);
        if (isExist) {
          throw ValidationError("api.common.validation_failed", {
            name: "api.modules.role.already_exists",
          });
        }
      }

      return this.repo.update(id, payload, tx);
    });
  }

  async delete(id: number) {
    const db = await this.repo.getExecutor();
    
    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.delete>> => {
      const role = await this.repo.findById(id);
      if (!role) {
        throw NotFoundError("api.modules.role.not_found");
      }

      await this.repo.delete(id, tx);
    });
  }

  async restore(id: number) {
    const db = await this.repo.getExecutor();
    
    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.restore>> => {
      const role = await this.repo.findById(id, true);
      if (!role) {
        throw NotFoundError("api.modules.role.not_found");
      }

      return await this.repo.restore(id, tx);
    });
  }

  // RBAC
  async assignRoleToUser(data: AssignRoleDTO) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.assignRoleToUser>> => {
      const role = await this.repo.findById(data.role_id);
      if (!role) {
        throw NotFoundError("api.modules.role.not_found");
      }

      const user = await this.repo.findUserById(data.model_id);
      if (!user) {
        throw NotFoundError("api.modules.user.not_found");
      }

      const isExistRole = await this.repo.isExistRole(data);
      if (isExistRole) {
        throw ValidationError("api.common.validation_failed", {
          role: "api.modules.role.already_assigned",
        });
      }

      // req user.id
      await this.redis.deleteCacheRbacByUserId(String(user.id));

      return await this.repo.assignRoleToUser(data, tx);
    });
  }

  async revokeRoleFromUser(data: RevokeRoleDTO) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.revokeRoleFromUser>> => {
      const role = await this.repo.findById(data.role_id);
      if (!role) {
        throw NotFoundError("api.modules.role.not_found");
      }

      const user = await this.repo.findUserById(data.model_id);
      if (!user) {
        throw NotFoundError("api.modules.user.not_found");
      }

      const isExistRole = await this.repo.isExistRole(data);
      if (!isExistRole) {
        throw NotFoundError("api.common.not_found");
      }

      // req user.id
      await this.redis.deleteCacheRbacByUserId(String(user.id));

      return await this.repo.revokeRoleFromUser(data, tx);
    });
  }
}
