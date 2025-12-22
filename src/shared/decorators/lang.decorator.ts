// src/shared/decorators/lang.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Lang = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.lang || 'id'; // default 'id' kalau ga ada
  },
);
