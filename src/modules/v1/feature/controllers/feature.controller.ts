/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/feature/controllers/feature.controller.ts
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

import { FeatureUseCase } from "@/modules/v1/feature/usecases/feature.usecase";
import * as featureTypes from "@/modules/v1/feature/domains/feature.types";
import { ListQueryDTO } from "@/modules/v1/feature/domains/feature.dto";
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

const MODULE_NAME = 'feature';
@UseGuards(AuthGuard, RbacGuard)
@Controller('v1/features')
export class FeatureController {
  private readonly logger = Loggers.feature;
  constructor(private readonly uc: FeatureUseCase) {}

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
      module: MODULE.FEATURE,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.feature.fetched'),
      httpCode: HTTP.OK,
      data: { ...response, access },
    });
  }

  @Post()
  @Roles('superadmin')
  @Permissions(`create:${MODULE_NAME}`)
  @HttpCode(HTTP.CREATED)
  async create(
    @Body(new ZodValidationPipe(featureTypes.CreateFeatureSchema)) 
    body: featureTypes.CreateFeatureDTO, 
    @Lang() lang: string
  ) {
    const data = await this.uc.create(body);

    this.logger.info(`Controller.create called.`, { data, body, lang });

    return ResponseTrait.success({
      module: MODULE.FEATURE,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.feature.created'),
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
      module: MODULE.FEATURE,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.feature.fetched'),
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
    @Body(new ZodValidationPipe(featureTypes.UpdateFeatureSchema)) 
    body: featureTypes.UpdateFeatureDTO, 
    @Lang() lang: string
  ) {
    const data = await this.uc.update(Number(id), body);

    this.logger.info(`Controller.update called.`, { data, id, body, lang });

    return ResponseTrait.success({
      module: MODULE.FEATURE,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.feature.updated'),
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
      module: MODULE.FEATURE,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.feature.deleted'),
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
      module: MODULE.FEATURE,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.feature.restored'),
      httpCode: HTTP.OK,
    });
  }
}
