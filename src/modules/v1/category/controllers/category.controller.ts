import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";

import { CategoryUseCase } from "@/modules/v1/category/usecases/category.usecase";
import * as categoryTypes from "@/modules/v1/category/domains/category.types";
import { ZodValidationPipe } from "@/shared/pipes/zod-validation.pipe";
import { ResponseTrait } from "@/shared/traits/response.trait";
import { MODULE, RESP_STATUS } from "@/shared/constants/response-code";
import { getMessage } from "@/shared/lang";
import { Lang } from "@/shared/decorators/lang.decorator";

@Controller('v1/categories')
export class CategoryController {
  constructor(private readonly uc: CategoryUseCase) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(categoryTypes.CreateCategorySchema)) 
    body: categoryTypes.CreateCategoryDTO, 
    @Lang() lang: string
  ) {
    const data = await this.uc.create(body);
    return ResponseTrait.success({
      module: MODULE.CATEGORY,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.category.created'),
      data,
    });
  }

  @Get()
  async list(@Query('page') page = 1, @Query('per_page') perPage = 10, @Lang() lang: string) {
    const response = await this.uc.list(Number(page), Number(perPage));
    return ResponseTrait.success({
      module: MODULE.CATEGORY,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.category.fetched'),
      data: response,
    });
  }

  @Get(':id')
  async detail(@Param('id') id: string, @Lang() lang: string) {
    const data = await this.uc.detail(Number(id));
    return ResponseTrait.success({
      module: MODULE.CATEGORY,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.category.fetched'),
      data,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body(new ZodValidationPipe(categoryTypes.UpdateCategorySchema)) 
    body: categoryTypes.UpdateCategoryDTO, 
    @Lang() lang: string) {
    const data = await this.uc.update(Number(id), body);
    return ResponseTrait.success({
      module: MODULE.CATEGORY,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.category.updated'),
      data,
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Lang() lang: string) {
    await this.uc.delete(Number(id));
    return ResponseTrait.success({
      module: MODULE.CATEGORY,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.category.deleted'),
    });
  }
}

