/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/division/controllers/division.controller.ts
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

import { DivisionUseCase } from "@/modules/v1/division/usecases/division.usecase";
import * as divisionTypes from "@/modules/v1/division/domains/division.types";
import { ListQueryDTO } from "@/modules/v1/division/domains/division.dto";
import { ZodValidationPipe } from "@/shared/pipes/zod-validation.pipe";
import { ResponseTrait } from "@/shared/traits/response.trait";
import { MODULE, RESP_STATUS } from "@/shared/constants/response-code";
import { getMessage } from "@/shared/lang";
import { Lang } from "@/shared/decorators/lang.decorator";
import { HTTP } from "@/shared/constants/http-status";
import { AuthGuard } from "@/shared/guards/auth.guard"; 
import { RolesGuard } from '@/shared/guards/role.guard';
import { PermissionsGuard } from '@/shared/guards/permission.guard';
import { Roles, Permissions } from '@/shared/decorators/rbac.decorator';
import { Loggers } from "@/shared/utils/logger";

const MODULE_NAME = 'division';
@UseGuards(AuthGuard, RolesGuard, PermissionsGuard)
@Controller('v1/divisions')
export class DivisionController {
  private readonly logger = Loggers.division;
  constructor(private readonly uc: DivisionUseCase) {}

  private buildAccess(permissions: string[] = []) {
    return {
      view: permissions.includes(`view:${MODULE_NAME}`),
      show: permissions.includes(`show:${MODULE_NAME}`),
      create: permissions.includes(`create:${MODULE_NAME}`),
      update: permissions.includes(`update:${MODULE_NAME}`),
      delete: permissions.includes(`delete:${MODULE_NAME}`),
      restore: permissions.includes(`restore:${MODULE_NAME}`),
    };
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

    const userPermissions = req.user?.permissions || [];
    const access = this.buildAccess(userPermissions);
    
    return ResponseTrait.success({
      module: MODULE.DIVISION,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.division.fetched'),
      httpCode: HTTP.OK,
      data: { ...response, access },
    });
  }

  @Post()
  @Roles('superadmin')
  @Permissions(`create:${MODULE_NAME}`)
  @HttpCode(HTTP.CREATED)
  async create(
    @Body(new ZodValidationPipe(divisionTypes.CreateDivisionSchema)) 
    body: divisionTypes.CreateDivisionDTO, 
    @Lang() lang: string
  ) {
    const data = await this.uc.create(body);

    this.logger.info(`Controller.create called.`, { data, body, lang });

    return ResponseTrait.success({
      module: MODULE.DIVISION,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.division.created'),
      httpCode: HTTP.CREATED,
      data,
    });
  }

  @Get(':id')
  @Roles('superadmin')
  @Permissions(`show:${MODULE_NAME}`)
  @HttpCode(HTTP.OK)
  async detail(@Param('id') id: number, @Lang() lang: string) {
    const data = await this.uc.detail(id);

    this.logger.info(`Controller.detail called.`, { data, id, lang });

    return ResponseTrait.success({
      module: MODULE.DIVISION,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.division.fetched'),
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
    @Body(new ZodValidationPipe(divisionTypes.UpdateDivisionSchema)) 
    body: divisionTypes.UpdateDivisionDTO, 
    @Lang() lang: string
  ) {
    const data = await this.uc.update(id, body);

    this.logger.info(`Controller.update called.`, { data, id, body, lang });

    return ResponseTrait.success({
      module: MODULE.DIVISION,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.division.updated'),
      httpCode: HTTP.OK,
      data,
    });
  }

  @Delete(':id')
  @Roles('superadmin')
  @Permissions(`delete:${MODULE_NAME}`)
  @HttpCode(HTTP.OK)
  async delete(@Param('id') id: number, @Lang() lang: string) {
    await this.uc.delete(id);

    this.logger.info(`Controller.delete called.`, { id, lang });
    
    return ResponseTrait.success({
      module: MODULE.DIVISION,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.division.deleted'),
      httpCode: HTTP.OK,
    });
  }

  @Post(':id/restore')
  @Roles('superadmin')
  @Permissions(`restore:${MODULE_NAME}`)
  @HttpCode(HTTP.OK)
  async restore(@Param('id') id: number, @Lang() lang: string) {
    await this.uc.restore(id);
    
    this.logger.info(`Controller.restore called.`, { id, lang });

    return ResponseTrait.success({
      module: MODULE.DIVISION,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.division.restored'),
      httpCode: HTTP.OK,
    });
  }
}
