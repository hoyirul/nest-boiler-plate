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
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";

import { ExampleUseCase } from "@/modules/v1/example/usecases/example.usecase";
import * as exampleTypes from "@/modules/v1/example/domains/example.types";
import { ListQueryDTO } from "@/modules/v1/example/domains/example.dto";
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
import { FileInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "@/shared/upload/multer";
import { FileValidationPipe } from "@/shared/pipes/file-validation.pipe";
import { env } from "@/core/config/env";
import { join } from "path";
import { replaceFile } from "@/shared/utils/file";

const MODULE_NAME = 'example';
@UseGuards(AuthGuard, RolesGuard, PermissionsGuard)
@Controller('v1/examples')
export class ExampleController {
  private readonly logger = Loggers.example;
  constructor(private readonly uc: ExampleUseCase) {}

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

  /**
   * List examples with pagination.
   *
   * Endpoint: GET /examples
   * Roles allowed: superadmin, admin
   * Required permission: view:example
   *
   * @param req - Request object, containing user info
   * @param page - Page number for pagination (default: 1)
   * @param perPage - Number of items per page (default: 10)
   * @param lang - Language code for response messages
   *
   * @returns {Promise<Object>} Response object containing:
   *   - module: module name
   *   - statusLabel: response status
   *   - message: localized success message
   *   - httpCode: HTTP status code
   *   - data: paginated list of examples + user access permissions
   */
  @Get()
  @Roles('superadmin', 'admin')
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
      module: MODULE.EXAMPLE,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.example.fetched'),
      httpCode: HTTP.OK,
      data: { ...response, access },
    });
  }

  @Post()
  @Roles('superadmin', 'admin')
  @Permissions(`create:${MODULE_NAME}`)
  @UseInterceptors(FileInterceptor('attachment', multerOptions(MODULE_NAME)))
  @HttpCode(HTTP.CREATED)
  async create(
    @UploadedFile(new FileValidationPipe()) attachment: Express.Multer.File,
    @Body(new ZodValidationPipe(exampleTypes.CreateExampleSchema.omit({ attachment: true }))) 
    body: Omit<exampleTypes.CreateExampleDTO, 'attachment'>, 
    @Lang() lang: string
  ) {
    const filePath = attachment
    ? join(MODULE_NAME, attachment.filename)
    : undefined;
    const data = await this.uc.create({
      ...body,
      attachment: filePath,
    });

    this.logger.info(`Controller.create called.`, { data, body, lang });

    return ResponseTrait.success({
      module: MODULE.EXAMPLE,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.example.created'),
      httpCode: HTTP.CREATED,
      data,
    });
  }

  @Get(':id')
  @Roles('superadmin', 'admin')
  @Permissions(`show:${MODULE_NAME}`)
  @HttpCode(HTTP.OK)
  async detail(@Param('id') id: string, @Lang() lang: string) {
    const data = await this.uc.detail(Number(id));

    this.logger.info(`Controller.detail called.`, { data, id, lang });

    return ResponseTrait.success({
      module: MODULE.EXAMPLE,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.example.fetched'),
      httpCode: HTTP.OK,
      data,
    });
  }

  @Patch(':id')
  @Roles('superadmin', 'admin')
  @Permissions(`update:${MODULE_NAME}`)
  @UseInterceptors(FileInterceptor('attachment', multerOptions(MODULE_NAME)))
  @HttpCode(HTTP.OK)
  async update(
    @Param('id') id: string, 
    @UploadedFile(new FileValidationPipe()) attachment: Express.Multer.File,
    @Body(new ZodValidationPipe(exampleTypes.UpdateExampleSchema)) 
    body: exampleTypes.UpdateExampleDTO, 
    @Lang() lang: string) {
      
    const existingData = await this.uc.detail(Number(id));

    const filePath = attachment 
    ? await replaceFile(existingData.attachment, attachment, MODULE_NAME)
    : existingData.attachment;

    const data = await this.uc.update(Number(id), {
      ...body,
      attachment: filePath ?? undefined,
    });

    this.logger.info(`Controller.update called.`, { data, id, body, lang });

    return ResponseTrait.success({
      module: MODULE.EXAMPLE,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.example.updated'),
      httpCode: HTTP.OK,
      data,
    });
  }

  @Delete(':id')
  @Roles('superadmin', 'admin')
  @Permissions(`delete:${MODULE_NAME}`)
  @HttpCode(HTTP.OK)
  async delete(@Param('id') id: string, @Lang() lang: string) {
    await this.uc.delete(Number(id));

    this.logger.info(`Controller.delete called.`, { id, lang });
    
    return ResponseTrait.success({
      module: MODULE.EXAMPLE,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.example.deleted'),
      httpCode: HTTP.OK,
    });
  }

  @Post(':id/restore')
  @Roles('superadmin', 'admin')
  @Permissions(`restore:${MODULE_NAME}`)
  @HttpCode(HTTP.OK)
  async restore(@Param('id') id: string, @Lang() lang: string) {
    await this.uc.restore(Number(id));

    this.logger.info(`Controller.restore called.`, { id, lang });
    
    return ResponseTrait.success({
      module: MODULE.EXAMPLE,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.example.restored'),
      httpCode: HTTP.OK,
    });
  }
}

