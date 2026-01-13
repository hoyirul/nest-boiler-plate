import { ExampleRepository } from "@/modules/v1/example/repositories/example.repository";
import { CreateExampleDTO, UpdateExampleDTO } from "@/modules/v1/example/domains/example.types";
import { NotFoundError, ValidationError } from "@/shared/utils/errors";
import { buildPaginationMeta } from "@/shared/utils/pagination";
import { ApprovalService } from "@/shared/services/approvals/approval.service";
import { ApprovalRepository } from "@/modules/v1/approval/repositories/approval.repository";
import { ApprovalLogRepository } from "@/modules/v1/approval/repositories/approval-log.repository";
import { AuthProvider } from "@/shared/providers/auth.provider";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ExampleUseCase {
  constructor(
    private readonly repo: ExampleRepository,
    private readonly approvalRepo: ApprovalRepository,
    private readonly approvalLogRepo: ApprovalLogRepository,
    private readonly authProvider: AuthProvider,
  ) {}

  private getUserId(): string {
    return this.authProvider.getUser().id || '_anonymous_';
  }

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

    const approvalLines = await this.approvalRepo.findByModelType('examples');
    const approvalLogs = await this.approvalLogRepo.findByModel('examples', id.toString());

    let approvalState: ReturnType<typeof ApprovalService.resolve> | null = null;
    if (this.getUserId()) {
      approvalState = ApprovalService.resolve({
        approvalLines,
        approvalLogs,
        currentUserId: this.getUserId(),
      });
    }

    return {
      ...example,
      approval: approvalState,
    };
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

  async changeStatus(id: number, statusId: number): Promise<{ name: string; status: string }> {
    const db = await this.repo.getExecutor();

    return await db.transaction(async (tx: unknown): Promise<{ name: string; status: string }> => {
      const result = await this.repo.findById(id);
      if (!result) {
        throw NotFoundError("api.modules.example.not_found");
      }

      if (!result.status) {
        throw ValidationError("api.common.validation_failed", {
          status: "api.modules.example.invalid_status",
        });
      }

      const { currentStatus, newStatus } = await this.repo.checkStatus(result.status.id, statusId);
      if((newStatus.sort_order <= currentStatus.sort_order) || (newStatus.sort_order - currentStatus.sort_order) > 1) {
        throw ValidationError("api.common.validation_failed", {
          status: "api.modules.example.status_transition_invalid",
        });
      }

      await this.repo.changeStatus(id, statusId, tx);

      return {
        name: result.name,
        status: newStatus.label,
      };
    });
  }

  async approvalLine(id: number) {
    const db = await this.repo.getExecutor();

    return db.transaction(async (tx: unknown) => {
      const example = await this.repo.findById(id);
      if (!example) throw NotFoundError("api.modules.example.not_found");

      const approvalLines = await this.approvalRepo.findByModelType('examples');
      const approvalLogs = await this.approvalLogRepo.findByModel('examples', id.toString());

      const state = ApprovalService.resolve({
        approvalLines,
        approvalLogs,
        currentUserId: this.getUserId(),
      });

      if (!state.can_approve) {
        throw ValidationError("api.common.validation_failed", {
          approval: "api.modules.example.not_allowed_to_approve",
        });
      }

      await this.approvalLogRepo.create({
        approval_id: state.current_approval_id!,
        model_type: 'examples',
        model_id: id.toString(),
        status_from: example.status?.id!,
        status_to: state.next_status!.id,
        changed_by: this.getUserId(),
      }, tx);

      await this.repo.changeStatus(id, state.next_status!.id, tx);
      return {
        name: example.name,
        status: state.next_status!.label,
        current_step: state.current_step,
      };
    });
  }
}
