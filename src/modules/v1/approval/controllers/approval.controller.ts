/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/approval/controllers/approval.controller.ts
 */

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  UseGuards,
  Req,
} from "@nestjs/common";

import { ApprovalUseCase } from "@/modules/v1/approval/usecases/approval.usecase";
import * as approvalTypes from "@/modules/v1/approval/domains/approval.types";
import { ListQueryDTO } from "@/modules/v1/approval/domains/approval.dto";
import { ZodValidationPipe } from "@/shared/pipes/zod-validation.pipe";
import { ResponseTrait } from "@/shared/traits/response.trait";
import { MODULE, RESP_STATUS } from "@/shared/constants/response-code";
import { getMessage } from "@/shared/lang";
import { Lang } from "@/shared/decorators/lang.decorator";
import { HTTP } from "@/shared/constants/http-status";
import { AuthGuard } from "@/shared/guards/auth.guard"; 
import { Roles, Permissions } from '@/shared/decorators/rbac.decorator';
import { Loggers } from "@/shared/utils/logger";
import { RbacGuard } from "@/shared/guards/rbac.guard";

const MODULE_NAME = 'approval';
@UseGuards(AuthGuard, RbacGuard)
@Controller('v1/approvals')
export class ApprovalController {
  private readonly logger = Loggers.approval;
  constructor(private readonly uc: ApprovalUseCase) {}

  private buildAccess(roles: string[] = [], permissions: string[] = []) {
    const isSuperAdmin = roles.includes('superadmin');

    const permissionMap = {
      view: `view:${MODULE_NAME}`,
      show: `show:${MODULE_NAME}`,
      create: `create:${MODULE_NAME}`,
      update: `update:${MODULE_NAME}`,
      delete: `delete:${MODULE_NAME}`,
      restore: `restore:${MODULE_NAME}`,
    } as const;

    return Object.fromEntries(
      Object.entries(permissionMap).map(([key, value]) => [
        key,
        isSuperAdmin || permissions.includes(value),
      ])
    );
  }

  @Get('ping')
  @HttpCode(HTTP.OK)
  ping() {
    return {
      message: 'pong',
    }
  }

  @Get()
  @Roles('superadmin')
  @Permissions(`view:${MODULE_NAME}`)
  @HttpCode(HTTP.OK)
  async list(
    @Req() req: any, 
    @Query() query: ListQueryDTO,
    @Lang() lang: string
  ): Promise<object> {
    const response = await this.uc.list(Number(query.page), Number(query.per_page), query.keywords, query.filters);

    this.logger.info(`Controller.list called.`, { response, page: query.page, perPage: query.per_page, keywords: query.keywords, filters: query.filters, lang });

    const userRoles = req.user?.roles || [];
    const userPermissions = req.user?.permissions || [];
    const access = this.buildAccess(userRoles, userPermissions);
    
    return ResponseTrait.success({
      module: MODULE.APPROVAL,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.approval.fetched'),
      httpCode: HTTP.OK,
      data: { ...response, access },
    });
  }

  @Post()
  @Roles('superadmin')
  @Permissions(`create:${MODULE_NAME}`)
  @HttpCode(HTTP.CREATED)
  async create(
    @Body(new ZodValidationPipe(approvalTypes.CreateApprovalSchema)) 
    body: approvalTypes.CreateApprovalDTO, 
    @Lang() lang: string
  ) {
    const data = await this.uc.create(body);

    this.logger.info(`Controller.create called.`, { data, body, lang });

    return ResponseTrait.success({
      module: MODULE.APPROVAL,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.approval.created'),
      httpCode: HTTP.CREATED,
      data,
    });
  }

  @Get(':id')
  @Roles('superadmin')
  @Permissions(`show:${MODULE_NAME}`)
  @HttpCode(HTTP.OK)
  async detail(@Param('id') id: number, @Lang() lang: string) {
    const data = await this.uc.detail(Number(id));

    this.logger.info(`Controller.detail called.`, { data, id, lang });

    return ResponseTrait.success({
      module: MODULE.APPROVAL,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.approval.fetched'),
      httpCode: HTTP.OK,
      data,
    });
  }

  @Patch(':id')
  @Roles('superadmin')
  @Permissions(`update:${MODULE_NAME}`)
  @HttpCode(HTTP.OK)
  async update(
    @Param('id') id: number, 
    @Body(new ZodValidationPipe(approvalTypes.UpdateApprovalSchema)) 
    body: approvalTypes.UpdateApprovalDTO, 
    @Lang() lang: string
  ) {
    const data = await this.uc.update(Number(id), body);

    this.logger.info(`Controller.update called.`, { data, id, body, lang });

    return ResponseTrait.success({
      module: MODULE.APPROVAL,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.approval.updated'),
      httpCode: HTTP.OK,
      data,
    });
  }

  @Delete(':id')
  @Roles('superadmin')
  @Permissions(`delete:${MODULE_NAME}`)
  @HttpCode(HTTP.OK)
  async delete(@Param('id') id: number, @Lang() lang: string) {
    await this.uc.delete(Number(id));

    this.logger.info(`Controller.delete called.`, { id, lang });
    
    return ResponseTrait.success({
      module: MODULE.APPROVAL,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.approval.deleted'),
      httpCode: HTTP.OK,
    });
  }

  @Post(':id/restore')
  @Roles('superadmin')
  @Permissions(`restore:${MODULE_NAME}`)
  @HttpCode(HTTP.OK)
  async restore(@Param('id') id: number, @Lang() lang: string) {
    await this.uc.restore(Number(id));
    
    this.logger.info(`Controller.restore called.`, { id, lang });

    return ResponseTrait.success({
      module: MODULE.APPROVAL,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.approval.restored'),
      httpCode: HTTP.OK,
    });
  }
}
