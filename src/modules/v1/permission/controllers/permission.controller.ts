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

import { PermissionUseCase } from "@/modules/v1/permission/usecases/permission.usecase";
import * as permissionTypes from "@/modules/v1/permission/domains/permission.types";
import { ListQueryDTO } from "@/modules/v1/permission/domains/permission.dto";
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

const MODULE_NAME = 'permission';
@UseGuards(AuthGuard, RolesGuard, PermissionsGuard)
@Controller('v1/permissions')
export class PermissionController {
  private readonly logger = Loggers.permission;
  constructor(private readonly uc: PermissionUseCase) {}
  private buildAccess(permissions: string[] = []) {
    return {
      view: permissions.includes(`view:${MODULE_NAME}`),
      show: permissions.includes(`show:${MODULE_NAME}`),
      create: permissions.includes(`create:${MODULE_NAME}`),
      update: permissions.includes(`update:${MODULE_NAME}`),
      delete: permissions.includes(`delete:${MODULE_NAME}`),
      restore: permissions.includes(`restore:${MODULE_NAME}`),
      apr: permissions.includes(`assign:${MODULE_NAME}:role`), // Assign Permission to Role
      rpr: permissions.includes(`revoke:${MODULE_NAME}:role`), // Revoke Permission from Role
      apu: permissions.includes(`assign:${MODULE_NAME}:user`), // Assign Permission to User
      rpu: permissions.includes(`revoke:${MODULE_NAME}:user`), // Revoke Permission from User
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
      module: MODULE.PERMISSION,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.permission.fetched'),
      httpCode: HTTP.OK,
      data: { ...response, access },
    });
  }

  @Post()
  @Roles('superadmin')
  @Permissions(`create:${MODULE_NAME}`)
  @HttpCode(HTTP.CREATED)
  async create(
    @Body(new ZodValidationPipe(permissionTypes.CreatePermissionSchema)) 
    body: permissionTypes.CreatePermissionDTO, 
    @Lang() lang: string
  ) {
    const data = await this.uc.create(body);

    this.logger.info(`Controller.create called.`, { data, body, lang });

    return ResponseTrait.success({
      module: MODULE.PERMISSION,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.permission.created'),
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
      module: MODULE.PERMISSION,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.permission.fetched'),
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
    @Body(new ZodValidationPipe(permissionTypes.UpdatePermissionSchema)) 
    body: permissionTypes.UpdatePermissionDTO, 
    @Lang() lang: string
  ) {
    const data = await this.uc.update(Number(id), body);

    this.logger.info(`Controller.update called.`, { data, id, body, lang });

    return ResponseTrait.success({
      module: MODULE.PERMISSION,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.permission.updated'),
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
      module: MODULE.PERMISSION,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.permission.deleted'),
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
      module: MODULE.PERMISSION,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.permission.restored'),
      httpCode: HTTP.OK,
    });
  }

  // RBAC
  @Post('assign-to-role')
  @Roles('superadmin')
  @Permissions(`assign:${MODULE_NAME}:role`)
  @HttpCode(HTTP.OK)
  async assignRoleToUser(
    @Body(new ZodValidationPipe(permissionTypes.AssignPermissionRoleSchema)) 
    body: permissionTypes.AssignPermissionRoleDTO, 
    @Lang() lang: string
  ) {
    await this.uc.assignPermissionToRole(body);
    this.logger.info(`Controller.assignPermissionToRole called.`, { body, lang });

    return ResponseTrait.success({
      module: MODULE.PERMISSION,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.permission.assigned'),
      httpCode: HTTP.OK,
    });
  }

  @Post('revoke-from-role')
  @Roles('superadmin')
  @Permissions(`revoke:${MODULE_NAME}:role`)
  @HttpCode(HTTP.OK)
  async revokePermissionFromRole(
    @Body(new ZodValidationPipe(permissionTypes.RevokePermissionRoleSchema)) 
    body: permissionTypes.RevokePermissionRoleDTO, 
    @Lang() lang: string
  ) {
    await this.uc.revokePermissionFromRole(body);
    this.logger.info(`Controller.revokePermissionFromRole called.`, { body, lang });

    return ResponseTrait.success({
      module: MODULE.PERMISSION,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.permission.revoked'),
      httpCode: HTTP.OK,
    });
  }

  @Post('assign-to-user')
  @Roles('superadmin')
  @Permissions(`assign:${MODULE_NAME}:user`)
  @HttpCode(HTTP.OK)
  async assignPermissionToUser(
    @Body(new ZodValidationPipe(permissionTypes.AssignPermissionUserSchema)) 
    body: permissionTypes.AssignPermissionUserDTO, 
    @Lang() lang: string
  ) {
    await this.uc.assignPermissionToUser(body);
    this.logger.info(`Controller.assignPermissionToUser called.`, { body, lang });

    return ResponseTrait.success({
      module: MODULE.PERMISSION,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.permission.assigned'),
      httpCode: HTTP.OK,
    });
  }

  @Post('revoke-from-user')
  @Roles('superadmin')
  @Permissions(`revoke:${MODULE_NAME}:user`)
  @HttpCode(HTTP.OK)
  async revokePermissionFromUser(
    @Body(new ZodValidationPipe(permissionTypes.RevokePermissionUserSchema)) 
    body: permissionTypes.RevokePermissionUserDTO, 
    @Lang() lang: string
  ) {
    await this.uc.revokePermissionFromUser(body);
    this.logger.info(`Controller.revokePermissionFromUser called.`, { body, lang });

    return ResponseTrait.success({
      module: MODULE.PERMISSION,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.permission.revoked'),
      httpCode: HTTP.OK,
    });
  }
}