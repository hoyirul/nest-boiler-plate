// src/shared/traits/response.trait.ts
import { HttpStatus } from '@nestjs/common';
import { makeCode, RESP_TYPE } from '@/shared/constants/response-code';

export class ResponseTrait {
  static success({
    module,
    statusLabel,
    message,
    data,
    httpCode = HttpStatus.OK,
  }: {
    module: string;
    statusLabel: string;
    message: string;
    data?: any;
    httpCode?: number;
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
    data,
    httpCode = HttpStatus.INTERNAL_SERVER_ERROR,
  }: {
    module: string;
    statusLabel: string;
    message: string;
    errors?: any;
    data?: any;
    httpCode?: number;
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
