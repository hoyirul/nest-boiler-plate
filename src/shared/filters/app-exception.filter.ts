import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  HttpException,
  BadRequestException,
} from "@nestjs/common";
import { AppError } from "@/shared/utils/errors";
import { ResponseTrait } from "@/shared/traits/response.trait";
import { MODULE, RESP_STATUS } from "@/shared/constants/response-code";
import { getMessage } from "@/shared/lang";
import { Loggers } from "@/shared/utils/logger";
import { ThrottlerException } from "@nestjs/throttler";
import { HTTP } from "@/shared/constants/http-status";

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const lang = request.lang || "id";
    const module = request.module || MODULE.GENERAL;

    const logMeta = {
      message: exception?.message,
      stack: exception?.stack,
      ...(exception instanceof AppError
        ? { msgKey: exception.msgKey, type: exception.type }
        : {}),
    };

    let status: number;
    let payload: any;

    if (exception instanceof AppError) {
      /** ===============================
       * Handling AppError seperti sebelumnya
       * =============================== */
      switch (exception.type) {
        case "Validation":
          Loggers.general.warn(`[${module}] Validation error`, logMeta);
          status = HttpStatus.UNPROCESSABLE_ENTITY;
          const translatedErrors: Record<string, string> = {};
          const errors = exception.errors as Record<string, string>;
          for (const field in errors) {
            translatedErrors[field] = getMessage(lang, errors[field]);
          }

          payload = ResponseTrait.error({
            module,
            httpCode: HttpStatus.UNPROCESSABLE_ENTITY,
            statusLabel: RESP_STATUS.VALIDATION,
            message: getMessage(lang, exception.msgKey),
            errors: translatedErrors,
          });
          break;
        case "NotFound":
          Loggers.general.warn(`[${module}] Not found error`, logMeta);
          status = HttpStatus.NOT_FOUND;
          payload = ResponseTrait.error({
            module,
            httpCode: status,
            statusLabel: RESP_STATUS.NOT_FOUND,
            message: getMessage(lang, exception.msgKey),
          });
          break;
        case "Auth":
          Loggers.general.warn(`[${module}] Auth error`, logMeta);
          status = HttpStatus.UNAUTHORIZED;
          payload = ResponseTrait.error({
            module,
            httpCode: status,
            statusLabel: RESP_STATUS.UNAUTHORIZED,
            message: getMessage(lang, exception.msgKey),
          });
          break;
        default:
          Loggers.general.error(`[${module}] Internal error`, logMeta);
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          payload = ResponseTrait.error({
            module,
            httpCode: status,
            statusLabel: RESP_STATUS.INTERNAL_SERVER_ERROR,
            message:
              process.env.NODE_ENV === "development"
                ? exception.msgKey
                : getMessage(lang, exception.msgKey),
          });
          break;
      }
    } else if (exception instanceof ThrottlerException) {
      /** ===============================
       * Handling ThrottlerException
       * =============================== */
      status = HTTP.TOO_MANY_REQUESTS;
      Loggers.general.warn(`[${module}] Rate limit exceeded`, logMeta);
      payload = ResponseTrait.error({
        module,
        httpCode: status,
        statusLabel: RESP_STATUS.TOO_MANY_REQUESTS,
        message: getMessage(lang, "api.common.too_many_requests"), // <--- sesuaikan key-nya
      });
    } else if (exception instanceof BadRequestException) {
      status = exception.getStatus();
      const resBody: any = exception.getResponse();

      Loggers.general.warn(`[${module}] BadRequestException`, logMeta);

      payload = ResponseTrait.error({
        module,
        httpCode: status,
        statusLabel: RESP_STATUS.VALIDATION,
        message:
          typeof resBody === 'string'
            ? getMessage(lang, resBody) // kalau string
            : getMessage(lang, resBody.message || "api.common.validation_failed"),
        errors:
          typeof resBody === 'object' && 'message' in resBody
            ? resBody.message
            : undefined,
      });
    } else if (exception instanceof HttpException) {
      /** ===============================
       * Handling HttpException
       * =============================== */
      status = exception.getStatus();
      const resBody: any = exception.getResponse();

      Loggers.general.warn(`[${module}] HttpException`, logMeta);

      payload = ResponseTrait.error({
        module,
        httpCode: status,
        statusLabel:
          status === HTTP.NOT_FOUND
            ? RESP_STATUS.NOT_FOUND
            : status === HTTP.UNAUTHORIZED
            ? RESP_STATUS.UNAUTHORIZED
            : status === HTTP.FORBIDDEN
            ? RESP_STATUS.FORBIDDEN
            : RESP_STATUS.INTERNAL_SERVER_ERROR,
        message:
          typeof resBody === 'string'
            ? resBody
            : getMessage(
                lang,
                status === HTTP.NOT_FOUND
                  ? "api.common.server_not_found"
                  : status === HTTP.UNAUTHORIZED
                  ? "api.common.unauthorized"
                  : status === HTTP.FORBIDDEN
                  ? "api.common.forbidden"
                  : "api.common.server_error"
              ),
      });
    } else {
      /** ===============================
       * Unknown error
       * =============================== */
      Loggers.general.error(`[${module}] Unknown error`, logMeta);
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      payload = ResponseTrait.error({
        module,
        httpCode: status,
        statusLabel: RESP_STATUS.INTERNAL_SERVER_ERROR,
        message:
          process.env.NODE_ENV === "development"
            ? exception.message
            : getMessage(lang, "api.common.server_error"),
      });
    }

    return response.status(status).json(payload);
  }
}
