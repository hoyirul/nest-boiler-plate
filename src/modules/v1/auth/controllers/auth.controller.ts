import { Controller, Post, Get, Body, UseGuards, HttpCode } from '@nestjs/common';
import * as authTypes from '@/modules/v1/auth/domains/auth.types';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { ResponseTrait } from '@/shared/traits/response.trait';
import { MODULE, RESP_STATUS } from '@/shared/constants/response-code';
import { getMessage } from '@/shared/lang';
import { Lang } from '@/shared/decorators/lang.decorator';
import { AuthUseCase } from '../usecases/auth.usecase';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { Token, CurrentUser } from '@/shared/decorators/auth.decorator';
import { HTTP } from '@/shared/constants/http-status';
import { Loggers } from "@/shared/utils/logger";

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly uc: AuthUseCase) {}

  @Post('login')
  @HttpCode(HTTP.OK)
  async login(
    @Body(new ZodValidationPipe(authTypes.LoginSchema)) body: authTypes.LoginDTO,
    @Lang() lang: string
  ) {
    const data = await this.uc.login(body);
    // log for res and req
    Loggers.auth.info(`Controller.login called.`, { data, body, lang });
    return ResponseTrait.success({
      module: MODULE.AUTH,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.auth.logged_in'),
      httpCode: HTTP.OK,
      data,
    });
  }

  @UseGuards(AuthGuard)
  @Get('me')
  @HttpCode(HTTP.OK)
  async me(@Token() token: string, @Lang() lang: string) {
    const data = await this.uc.me(token);
    Loggers.auth.info(`Controller.me called.`, { token, lang });
    return ResponseTrait.success({
      module: MODULE.AUTH,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.auth.fetched_me'),
      httpCode: HTTP.OK,
      data,
    });
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  @HttpCode(HTTP.OK)
  async logout(@Token() token: string, @Lang() lang: string) {
    await this.uc.logout(token);
    Loggers.auth.info(`Controller.logout called.`, { token, lang });
    return ResponseTrait.success({
      module: MODULE.AUTH,
      statusLabel: RESP_STATUS.OK,
      message: getMessage(lang, 'api.modules.auth.logged_out'),
      httpCode: HTTP.OK,
      data: null,
    });
  }
}
