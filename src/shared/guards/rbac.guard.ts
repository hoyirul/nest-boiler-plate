import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, PERMISSIONS_KEY } from '@/shared/decorators/rbac.decorator';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const cls = context.getClass();

    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [handler, cls]) || [];

    const requiredPerms =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [handler, cls]) || [];

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    // kalau endpoint tidak set roles & perms → auto allowed
    if (requiredRoles.length === 0 && requiredPerms.length === 0) return true;

    const hasRole =
      requiredRoles.length === 0 ||
      requiredRoles.some(r => user?.roles?.includes(r));

    const hasPermission =
      requiredPerms.length === 0 ||
      requiredPerms.some(p => user?.permissions?.includes(p));

    return hasRole || hasPermission;
  }
}