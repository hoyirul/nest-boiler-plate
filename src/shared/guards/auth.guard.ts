import { CanActivate, ExecutionContext, Injectable, Scope } from '@nestjs/common';
import { AuthUseCase } from '@/modules/v1/auth/usecases/auth.usecase';
import { AuthError } from '@/shared/utils/errors';
import { verifyToken } from '@/shared/utils/jwt';
import { AuthProvider } from '@/shared/providers/auth.provider';

@Injectable({ scope: Scope.REQUEST })
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authUseCase: AuthUseCase,
    private readonly authProvider: AuthProvider
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    let token: string | undefined;

    // 1️⃣ PRIORITY: Authorization Header (Postman, service-to-service)
    const authHeader = req.headers['authorization'] as string;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '').trim();
    }

    // 2️⃣ FALLBACK: Cookie (Browser)
    if (!token && req.cookies?.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      throw AuthError('api.common.unauthorized');
    }

    // verify JWT signature & exp
    await verifyToken(token);

    // Ambil userId & RBAC dari Redis
    const user = await this.authUseCase.me(token);
    if (!user) {
      throw AuthError('api.modules.auth.validation.token_not_found');
    }

    // attach to request
    req.user = {
      id: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
    };

    req.token = token;
    this.authProvider.setUser(req.user);

    return true;
  }
}