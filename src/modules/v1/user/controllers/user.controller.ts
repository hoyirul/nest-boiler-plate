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

import { UserUseCase } from "@/modules/v1/user/usecases/user.usecase";
import * as userTypes from "@/modules/v1/user/domains/user.types";
import { ListQueryDTO } from "@/modules/v1/user/domains/user.dto";
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

const MODULE_NAME = 'user';
@UseGuards(AuthGuard, RolesGuard, PermissionsGuard)
@Controller('v1/users')
export class UserController {
  private readonly logger = Loggers.user;
  constructor(private readonly uc: UserUseCase) {}

  private buildAccess(permissions: string[] = []) {
    return {
      view: permissions.includes(`view:${MODULE_NAME}`),
      show: permissions.includes(`show:${MODULE_NAME}`),
      create: permissions.includes(`create:${MODULE_NAME}`),
      update: permissions.includes(`update:${MODULE_NAME}`),
      us: permissions.includes(`update:${MODULE_NAME}:status`), // Update Status
      up: permissions.includes(`update:${MODULE_NAME}:password`), // Update Password
      ue: permissions.includes(`update:${MODULE_NAME}:email`), // Update Email
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
      module: MODULE.USER,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.user.fetched'),
      httpCode: HTTP.OK,
      data: { ...response, access },
    });
  }

  @Post()
  @Roles('superadmin')
  @Permissions(`create:${MODULE_NAME}`)
  @HttpCode(HTTP.CREATED)
  async create(
    @Body(new ZodValidationPipe(userTypes.CreateUserSchema)) 
    body: userTypes.CreateUserDTO, 
    @Lang() lang: string
  ) {
    const data = await this.uc.create(body);

    this.logger.info(`Controller.create called.`, { data, body, lang });

    return ResponseTrait.success({
      module: MODULE.USER,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.user.created'),
      httpCode: HTTP.CREATED,
      data,
    });
  }

  @Get(':id')
  @Roles('superadmin')
  @Permissions(`show:${MODULE_NAME}`)
  @HttpCode(HTTP.OK)
  async detail(@Param('id') id: string, @Lang() lang: string) {
    const data = await this.uc.detail(String(id));

    this.logger.info(`Controller.detail called.`, { data, id, lang });

    return ResponseTrait.success({
      module: MODULE.USER,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.user.fetched'),
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
    @Body(new ZodValidationPipe(userTypes.UpdateUserSchema)) 
    body: userTypes.UpdateUserDTO, 
    @Lang() lang: string
  ) {
    const data = await this.uc.update(String(id), body);
    this.logger.info(`Controller.update called.`, { data, id, body, lang });

    return ResponseTrait.success({
      module: MODULE.USER,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.user.updated'),
      httpCode: HTTP.OK,
      data,
    });
  }

  @Patch(':id/status')
  @Roles('superadmin')
  @Permissions(`update:${MODULE_NAME}:status`)
  @HttpCode(HTTP.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(userTypes.UpdateStatusSchema)) 
    body: userTypes.UpdateStatusDTO, 
    @Lang() lang: string
  ) {
    const data = await this.uc.updateStatus(String(id), body.status);

    this.logger.info(`Controller.updateStatus called.`, { data, id, lang });

    return ResponseTrait.success({
      module: MODULE.USER,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.user.status_updated'),
      httpCode: HTTP.OK,
      data,
    });
  }
  
  @Patch(':id/password')
  @Roles('superadmin')
  @Permissions(`update:${MODULE_NAME}:password`)
  @HttpCode(HTTP.OK)
  async updatePassword(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(userTypes.UpdatePasswordSchema)) 
    body: userTypes.UpdatePasswordDTO, 
    @Lang() lang: string
  ) {
    const data = await this.uc.updatePassword(String(id), body);

    this.logger.info(`Controller.updatePassword called.`, { data, id, body, lang });

    return ResponseTrait.success({
      module: MODULE.USER,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.user.password_updated'),
      httpCode: HTTP.OK,
      data,
    });
  }
  
  @Patch(':id/email')
  @Roles('superadmin')
  @Permissions(`update:${MODULE_NAME}:email`)
  @HttpCode(HTTP.OK)
  async updateEmail(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(userTypes.UpdateEmailSchema)) 
    body: userTypes.UpdateEmailDTO, 
    @Lang() lang: string
  ) {
    const data = await this.uc.updateEmail(String(id), body);

    this.logger.info(`Controller.updateEmail called.`, { data, id, body, lang });

    return ResponseTrait.success({
      module: MODULE.USER,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.user.email_updated'),
      httpCode: HTTP.OK,
      data,
    });
  }
}

