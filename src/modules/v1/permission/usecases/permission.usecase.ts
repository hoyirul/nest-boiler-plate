import { PermissionRepository } from "@/modules/v1/permission/repositories/permission.repository";
import { RedisCache } from "@/shared/redis/cache.redis";
import { 
  CreatePermissionDTO, 
  UpdatePermissionDTO,
  AssignPermissionRoleDTO, 
  RevokePermissionRoleDTO,
  AssignPermissionUserDTO,
  RevokePermissionUserDTO,
  AssignPermissionFeatureDTO,
  RevokePermissionFeatureDTO
} from "@/modules/v1/permission/domains/permission.types";
import { NotFoundError, ValidationError } from "@/shared/utils/errors";
import { buildPaginationMeta } from "@/shared/utils/pagination";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PermissionUseCase {
  constructor(
    private readonly repo: PermissionRepository,
    private readonly redis: RedisCache
  ) {}

  async create(payload: CreatePermissionDTO) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.create>> => {
      const isExist = await this.repo.isExist(payload.name);
      if (isExist) {
        throw ValidationError("api.common.validation_failed", {
          name: "api.modules.permission.already_exists",
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
    const permission = await this.repo.findById(id);
    if (!permission) {
      throw NotFoundError("api.modules.permission.not_found");
    }
    return permission;
  }

  async update(id: number, payload: UpdatePermissionDTO) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.update>> => {
      const permission = await this.repo.findById(id);
      if (!permission) {
        throw NotFoundError("api.modules.permission.not_found");
      }

      if (payload.name && payload.name.toLowerCase() !== permission.name) {
        const isExist = await this.repo.isExist(payload.name);
        if (isExist) {
          throw ValidationError("api.common.validation_failed", {
            name: "api.modules.permission.already_exists",
          });
        }
      }

      return this.repo.update(id, payload, tx);
    });
  }

  async delete(id: number) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.delete>> => {
      const permission = await this.repo.findById(id);
      if (!permission) {
        throw NotFoundError("api.modules.permission.not_found");
      }

      return await this.repo.delete(id, tx);
    });
  }

  async restore(id: number) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.restore>> => {
      const permission = await this.repo.findById(id, true);
      if (!permission) {
        throw NotFoundError("api.modules.permission.not_found");
      }

      return await this.repo.restore(id, tx);
    });
  }

  async assignPermissionToRole(data: AssignPermissionRoleDTO) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.assignPermissionToRole>> => {
      const permission = await this.repo.findInId(data.permission_ids);
      if (!permission) {
        throw NotFoundError("api.modules.permission.not_found");
      }

      const role = await this.repo.findRoleById(data.role_id);
      if (!role) {
        throw NotFoundError("api.modules.role.not_found");
      }

      const isExist: boolean = await this.repo.isExistPermissionRole(data);
      if (isExist) {
        throw ValidationError("api.common.validation_failed", {
          role: "api.modules.permission.permission_role",
        });
      }
      
      // req user.id
      await this.redis.deleteCacheRbacAll();

      return await this.repo.assignPermissionToRole(data, tx);
    });
  }

  async revokePermissionFromRole(data: RevokePermissionRoleDTO) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.revokePermissionFromRole>> => {
      const permission = await this.repo.findInId(data.permission_ids);
      if (!permission) {
        throw NotFoundError("api.modules.permission.not_found");
      }

      const role = await this.repo.findRoleById(data.role_id);
      if (!role) {
        throw NotFoundError("api.modules.role.not_found");
      }

      const isExist: boolean = await this.repo.isExistPermissionRole(data);
      if (!isExist) {
        throw NotFoundError("api.common.not_found");
      }
      
      // req user.id
      await this.redis.deleteCacheRbacAll();

      return await this.repo.revokePermissionFromRole(data, tx);
    });
  }

  async assignPermissionToUser(data: AssignPermissionUserDTO) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.assignPermissionToUser>> => {
      const permission = await this.repo.findInId(data.permission_ids);
      if (!permission) {
        throw NotFoundError("api.modules.permission.not_found");
      }

      const user = await this.repo.findUserById(data.model_id);
      if (!user) {
        throw NotFoundError("api.modules.user.not_found");
      }

      const isExist: boolean = await this.repo.isExistPermissionUser(data);
      if (isExist) {
        throw ValidationError("api.common.validation_failed", {
          user: "api.modules.permission.permission_user",
        });
      }

      // req user.id
      await this.redis.deleteCacheRbacByUserId(String(user.id));

      return await this.repo.assignPermissionToUser(data, tx);
    });
  }

  async revokePermissionFromUser(data: RevokePermissionUserDTO) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.revokePermissionFromUser>> => {
      const permission = await this.repo.findInId(data.permission_ids);
      if (!permission) {
        throw NotFoundError("api.modules.permission.not_found");
      }

      const user = await this.repo.findUserById(data.model_id);
      if (!user) {
        throw NotFoundError("api.modules.user.not_found");
      }
      
      const isExist: boolean = await this.repo.isExistPermissionUser(data);
      if (!isExist) {
        throw NotFoundError("api.common.not_found");
      }

      // req user.id
      await this.redis.deleteCacheRbacByUserId(String(user.id));

      return await this.repo.revokePermissionFromUser(data, tx);
    });
  }

  async assignPermissionToFeature(data: AssignPermissionFeatureDTO) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.assignPermissionToFeature>> => {
      const permission = await this.repo.findById(data.permission_id);
      if (!permission) {
        throw NotFoundError("api.modules.permission.not_found");
      }

      const feature = await this.repo.findFeatureById(data.feature_id);
      if (!feature) {
        throw NotFoundError("api.modules.feature.not_found");
      }

      const isExist: boolean = await this.repo.isExistPermissionFeature(data);
      if (isExist) {
        throw ValidationError("api.common.validation_failed", {
          feature: "api.modules.permission.permission_feature",
        });
      }

      await this.redis.deleteCacheRbacByUserId(String(feature.id));

      return await this.repo.assignPermissionToFeature(data, tx);
    });
  }

  async revokePermissionFromFeature(data: RevokePermissionFeatureDTO) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.revokePermissionFromFeature>> => {
      const permission = await this.repo.findById(data.permission_id);
      if (!permission) {
        throw NotFoundError("api.modules.permission.not_found");
      }

      const feature = await this.repo.findFeatureById(data.feature_id);
      if (!feature) {
        throw NotFoundError("api.modules.feature.not_found");
      }
      
      const isExist: boolean = await this.repo.isExistPermissionFeature(data);
      if (!isExist) {
        throw NotFoundError("api.common.not_found");
      }

      // req user.id
      await this.redis.deleteCacheRbacByUserId(String(feature.id));

      return await this.repo.revokePermissionFromFeature(data, tx);
    });
  }
}