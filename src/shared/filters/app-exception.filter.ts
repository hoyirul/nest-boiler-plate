import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
} from "@nestjs/common";
import { Response } from "express";
import { AppError } from "@/shared/utils/errors";
import { ResponseTrait } from "@/shared/traits/response.trait";
import { MODULE, RESP_STATUS } from "@/shared/constants/response-code";
import { HTTP } from "@/shared/constants/http-status";
import { getMessage } from "@/shared/lang";
import { Loggers } from "@/shared/utils/logger";

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(e: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    const res: Response = ctx.getResponse();

    const lang = req.lang || "id";
    const module = req.module || MODULE.GENERAL;

    const logMeta = {
      message: e?.message,
      stack: e?.stack,
      ...(e instanceof AppError
        ? { msgKey: e.msgKey, type: e.type }
        : {}),
    };

    /** ===============================
     * AppError handling
     * =============================== */
    if (e instanceof AppError) {
      switch (e.type) {
        case "Validation": {
          Loggers.general.warn(`[${module}] Validation error`, logMeta);

          return res
            .status(HTTP.UNPROCESSABLE_ENTITY)
            .json(
              ResponseTrait.error({
                module,
                httpCode: HTTP.UNPROCESSABLE_ENTITY,
                statusLabel: RESP_STATUS.VALIDATION,
                message: getMessage(lang, e.msgKey),
                errors: e.errors,
              })
            );
        }

        case "NotFound": {
          Loggers.general.warn(`[${module}] Not found error`, logMeta);

          return res
            .status(HTTP.NOT_FOUND)
            .json(
              ResponseTrait.error({
                module,
                httpCode: HTTP.NOT_FOUND,
                statusLabel: RESP_STATUS.NOT_FOUND,
                message: getMessage(lang, e.msgKey),
              })
            );
        }

        case "Auth": {
          Loggers.general.warn(`[${module}] Auth error`, logMeta);

          return res
            .status(HTTP.UNAUTHORIZED)
            .json(
              ResponseTrait.error({
                module,
                httpCode: HTTP.UNAUTHORIZED,
                statusLabel: RESP_STATUS.UNAUTHORIZED,
                message: getMessage(lang, e.msgKey),
              })
            );
        }

        default: {
          Loggers.general.error(`[${module}] Internal error`, logMeta);

          return res
            .status(HTTP.INTERNAL_SERVER_ERROR)
            .json(
              ResponseTrait.error({
                module,
                httpCode: HTTP.INTERNAL_SERVER_ERROR,
                statusLabel: RESP_STATUS.INTERNAL_SERVER_ERROR,
                message:
                  process.env.NODE_ENV === "development"
                    ? e.msgKey
                    : getMessage(lang, e.msgKey),
              })
            );
        }
      }
    }

    /** ===============================
     * Unknown error
     * =============================== */
    Loggers.general.error(`[${module}] Unknown error`, logMeta);

    return res
      .status(HTTP.INTERNAL_SERVER_ERROR)
      .json(
        ResponseTrait.error({
          module,
          httpCode: HTTP.INTERNAL_SERVER_ERROR,
          statusLabel: RESP_STATUS.INTERNAL_SERVER_ERROR,
          message:
            process.env.NODE_ENV === "development"
              ? e.message
              : getMessage(lang, "api.common.server_error"),
        })
      );
  }
}
