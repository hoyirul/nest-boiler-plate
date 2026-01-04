import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthUseCase } from '@/modules/v1/auth/usecases/auth.usecase';
import { AuthError } from '@/shared/utils/errors';
import { verifyToken } from '@/shared/utils/jwt';
import { AuthProvider } from '@/shared/providers/auth.provider';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authUseCase: AuthUseCase,
    private readonly authProvider: AuthProvider
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'] as string;
    if (!authHeader?.startsWith('Bearer ')) throw AuthError('api.common.unauthorized');

    const token = authHeader.replace('Bearer ', '').trim();
    await verifyToken(token);

    // Ambil userId & rbac dari Redis
    const user = await this.authUseCase.me(token);
    
    if (!user) throw AuthError('api.modules.auth.validation.token_not_found');

    req.user = { 
      id: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions
    };
    req.token = token;
    this.authProvider.setUser(req.user);

    return true;
  }
}
