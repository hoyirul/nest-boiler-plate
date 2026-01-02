import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '@/shared/decorators/rbac.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPerms = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPerms || requiredPerms.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user; // pastikan AuthGuard udah inject user

    return requiredPerms.some(p => user.permissions?.includes(p));
  }
}
