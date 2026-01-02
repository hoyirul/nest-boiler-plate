// src/shared/traits/response.trait.ts
import { HttpStatus } from '@nestjs/common';
import { makeCode, RESP_TYPE } from '@/shared/constants/response-code';

export class ResponseTrait {
  static success({
    module,
    statusLabel,
    message,
    httpCode = HttpStatus.OK,
    data,
  }: {
    module: string;
    statusLabel: string;
    message: string;
    httpCode?: number;
    data?: any;
  }) {
    const code = makeCode(RESP_TYPE.SUCCESS, module, httpCode, statusLabel);
    return {
      code,
      success: true,
      message,
      data: data ?? null,
    };
  }

  static error({
    module,
    statusLabel,
    message,
    errors,
    httpCode = HttpStatus.INTERNAL_SERVER_ERROR,
    data,
  }: {
    module: string;
    statusLabel: string;
    message: string;
    errors?: any;
    httpCode?: number;
    data?: any;
  }) {
    const code = makeCode(RESP_TYPE.ERROR, module, httpCode, statusLabel);
    return {
      code,
      success: false,
      message,
      errors: errors ?? undefined,
      data: data ?? undefined,
    };
  }
}
