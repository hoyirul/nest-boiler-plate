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

import { RoleUseCase } from "@/modules/v1/role/usecases/role.usecase";
import * as roleTypes from "@/modules/v1/role/domains/role.types";
import { ListQueryDTO } from "@/modules/v1/role/domains/role.dto";
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

const MODULE_NAME = 'role';
@UseGuards(AuthGuard, RolesGuard, PermissionsGuard)
@Controller('v1/roles')
export class RoleController {
  private readonly logger = Loggers.role;
  constructor(private readonly uc: RoleUseCase) {}

  private buildAccess(permissions: string[] = []) {
    return {
      view: permissions.includes(`view:${MODULE_NAME}`),
      show: permissions.includes(`show:${MODULE_NAME}`),
      create: permissions.includes(`create:${MODULE_NAME}`),
      update: permissions.includes(`update:${MODULE_NAME}`),
      delete: permissions.includes(`delete:${MODULE_NAME}`),
      restore: permissions.includes(`restore:${MODULE_NAME}`),
      aru: permissions.includes(`assign:${MODULE_NAME}:user`), // Assign Role to User
      rru: permissions.includes(`revoke:${MODULE_NAME}:user`), // Revoke Role from User
    };
  }

  /*
    * Ping Endpoint
  */
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
      module: MODULE.ROLE,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.role.fetched'),
      httpCode: HTTP.OK,
      data: { ...response, access },
    });
  }

  @Post()
  @Roles('superadmin')
  @Permissions(`create:${MODULE_NAME}`)
  @HttpCode(HTTP.CREATED)
  async create(
    @Body(new ZodValidationPipe(roleTypes.CreateRoleSchema)) 
    body: roleTypes.CreateRoleDTO, 
    @Lang() lang: string
  ) {
    const data = await this.uc.create(body);

    this.logger.info(`Controller.create called.`, { data, body, lang });

    return ResponseTrait.success({
      module: MODULE.ROLE,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.role.created'),
      httpCode: HTTP.CREATED,
      data,
    });
  }

  @Get(':id')
  @Roles('superadmin')
  @Permissions(`show:${MODULE_NAME}`)
  @HttpCode(HTTP.OK)
  async detail(@Param('id') id: string, @Lang() lang: string) {
    const data = await this.uc.detail(Number(id));

    this.logger.info(`Controller.detail called.`, { data, id, lang });

    return ResponseTrait.success({
      module: MODULE.ROLE,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.role.fetched'),
      httpCode: HTTP.OK,
      data,
    });
  }

  @Patch(':id')
  @Roles('superadmin')
  @Permissions(`update:${MODULE_NAME}`)
  @HttpCode(HTTP.OK)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(roleTypes.UpdateRoleSchema)) 
    body: roleTypes.UpdateRoleDTO, 
    @Lang() lang: string
  ) {
    const data = await this.uc.update(Number(id), body);

    this.logger.info(`Controller.update called.`, { data, id, body, lang });

    return ResponseTrait.success({
      module: MODULE.ROLE,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.role.updated'),
      httpCode: HTTP.OK,
      data,
    });
  }

  @Delete(':id')
  @Roles('superadmin')
  @Permissions(`delete:${MODULE_NAME}`)
  @HttpCode(HTTP.OK)
  async delete(@Param('id') id: string, @Lang() lang: string) {
    await this.uc.delete(Number(id));

    this.logger.info(`Controller.delete called.`, { id, lang });
    
    return ResponseTrait.success({
      module: MODULE.ROLE,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.role.deleted'),
      httpCode: HTTP.OK,
    });
  }

  @Post(':id/restore')
  @Roles('superadmin')
  @Permissions(`restore:${MODULE_NAME}`)
  @HttpCode(HTTP.OK)
  async restore(@Param('id') id: string, @Lang() lang: string) {
    await this.uc.restore(Number(id));

    this.logger.info(`Controller.restore called.`, { id, lang });
    
    return ResponseTrait.success({
      module: MODULE.ROLE,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.role.restored'),
      httpCode: HTTP.OK,
    });
  }

  // RBAC
  @Post('assign')
  @Roles('superadmin')
  @Permissions(`assign:${MODULE_NAME}:user`)
  @HttpCode(HTTP.OK)
  async assignRoleToUser(
    @Body(new ZodValidationPipe(roleTypes.AssignRoleSchema)) 
    body: roleTypes.AssignRoleDTO, 
    @Lang() lang: string
  ) {
    await this.uc.assignRoleToUser(body);
    this.logger.info(`Controller.assignRoleToUser called.`, { body, lang });

    return ResponseTrait.success({
      module: MODULE.ROLE,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.role.assigned'),
      httpCode: HTTP.OK,
    });
  }

  @Post('revoke')
  @Roles('superadmin')
  @Permissions(`revoke:${MODULE_NAME}:user`)
  @HttpCode(HTTP.OK)
  async revokeRoleFromUser(
    @Body(new ZodValidationPipe(roleTypes.RevokeRoleSchema)) 
    body: roleTypes.RevokeRoleDTO, 
    @Lang() lang: string
  ) {
    await this.uc.revokeRoleFromUser(body);
    this.logger.info(`Controller.revokeRoleFromUser called.`, { body, lang });

    return ResponseTrait.success({
      module: MODULE.ROLE,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.role.revoked'),
      httpCode: HTTP.OK,
    });
  }
}

