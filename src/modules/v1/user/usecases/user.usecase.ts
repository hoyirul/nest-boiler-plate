import { UserRepository } from "@/modules/v1/user/repositories/user.repository";
import { 
  CreateUserDTO, 
  UpdateUserDTO, 
  UpdatePasswordDTO,
  UpdateEmailDTO
} from "@/modules/v1/user/domains/user.types";
import { NotFoundError, ValidationError } from "@/shared/utils/errors";
import { buildPaginationMeta } from "@/shared/utils/pagination";
import bcrypt from 'bcryptjs';
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserUseCase {
  constructor(private readonly repo: UserRepository) {}
  async create(payload: CreateUserDTO) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.create>> => {
      const isExist: boolean = await this.repo.isExist(payload.name, payload.email);
      if (isExist) {
        throw ValidationError("api.common.validation_failed", {
          email: "api.modules.user.validation.user.already_exists",
        });
      }

      if(payload.password !== payload.confirm_password) {
        throw ValidationError("api.common.validation_failed", {
          confirm_password: "api.modules.user.validation.confirm_password.match",
        });
      }

      payload.password = await bcrypt.hash(payload.password, 10);

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

  async detail(id: string) {
    const user = await this.repo.findById(id);
    if (!user) {
      throw NotFoundError("api.modules.user.not_found");
    }
    return user;
  }

  async update(id: string, payload: UpdateUserDTO) {
    const db = await this.repo.getExecutor();
    
    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.update>> => {
      const user = await this.repo.findById(id);
      if (!user) {
        throw NotFoundError("api.modules.user.not_found");
      }

      if (typeof payload.name !== "string" || typeof user.email !== "string") {
        throw ValidationError("api.common.validation_failed", {
          email: "api.modules.user.validation.invalid_name_or_email",
        });
      }
      const isExist: boolean = await this.repo.isExist(payload.name, user.email);
      if (isExist) {
        throw ValidationError("api.common.validation_failed", {
          email: "api.modules.user.validation.user.already_exists",
        });
      }

      return this.repo.update(id, payload, tx);
    });
  }

  async updateStatus(id: string, status: string) {
    const db = await this.repo.getExecutor();
    
    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.updateStatus>> => {
      const user = await this.repo.findById(id);
      if (!user) {
        throw NotFoundError("api.modules.user.not_found");
      }

      return await this.repo.updateStatus(id, status, tx);
    });
  }

  async updatePassword(id: string, data: UpdatePasswordDTO) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.updatePassword>> => {
      const user = await this.repo.findByIdWithPassword(id);
      if (!user) {
        throw NotFoundError("api.modules.user.not_found");
      }

      const isMatch = await bcrypt.compare(data.current_password, user.password);
      if (!isMatch) {
        throw ValidationError("api.common.validation_failed", {
          current_password: "api.modules.user.validation.current_password.incorrect",
        });
      }

      const isSamePassword = await bcrypt.compare(data.new_password, user.password);
      if (isSamePassword) {
        throw ValidationError("api.common.validation_failed", {
          new_password: "api.modules.user.validation.new_password.same_as_current",
        });
      }

      // password harus menggunakan minimal 1 huruf kecil, 1 huruf besar, 1 angka, dan 1 simbol
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
      if (!passwordRegex.test(data.new_password)) {
        throw ValidationError("api.common.validation_failed", {
          new_password: "api.modules.user.validation.new_password.invalid_format",
        });
      }

      if (data.new_password.includes(" ")) {
        throw ValidationError("api.common.validation_failed", {
          new_password: "api.modules.user.validation.new_password.contains_space",
        });
      }

      data.new_password = await bcrypt.hash(data.new_password, 10);

      return await this.repo.updatePassword(id, data, tx);
    });
  }

  async updateEmail(id: string, data: UpdateEmailDTO) {
    const db = await this.repo.getExecutor();

    await db.transaction(async (tx: unknown): Promise<ReturnType<typeof this.repo.updateEmail>> => {
      const user = await this.repo.findById(id);
      if (!user) {
        throw NotFoundError("api.modules.user.not_found");
      }

      return await this.repo.updateEmail(id, data, tx);
    });
  }
}
