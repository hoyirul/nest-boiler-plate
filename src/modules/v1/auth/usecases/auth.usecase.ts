import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { AuthRepository } from '@/modules/v1/auth/repositories/auth.repository';
import { AuthSessionRedisRepository } from '@/modules/v1/auth/repositories/auth.redis.repository';
import { LoginDTO } from '@/modules/v1/auth/domains/auth.types';
import { AuthError } from '@/shared/utils/errors';
import { createToken, verifyToken } from '@/shared/utils/jwt';
import { env } from '@/core/config/env';

@Injectable()
export class AuthUseCase {
  constructor(
    private readonly repo: AuthRepository,
    private readonly sessionRepo: AuthSessionRedisRepository
  ) {}

  async login(payload: LoginDTO) {
    const user = await this.repo.findByEmail(payload.email);
    if (!user) throw AuthError('api.modules.auth.validation.invalid_credentials');

    const valid = await bcrypt.compare(payload.password, user.password);
    if (!valid) throw AuthError('api.modules.auth.validation.invalid_credentials');

    const expiresInSec = parseInt(env.JWT_EXPIRES_IN) || 86400;
    const { token, jti, exp } = await createToken({ id: String(user.id), email: user.email }, expiresInSec);

    const ttl = exp - Math.floor(Date.now() / 1000);
    await this.sessionRepo.createSession(String(user.id), jti, ttl);

    return {
      token_type: 'Bearer',
      access_token: token,
      expires_in: ttl,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  }

  async me(token: string) {
    const payload = await verifyToken(token);
    const { token: userId, rbac } = await this.sessionRepo.findByJti(payload.jti);
    if (!userId) throw AuthError('api.modules.auth.validation.token_not_found');

    // if redis not found
    if(!rbac) {
      const user = await this.repo.findByIdWithRbac(String(userId));
      if (!user) throw AuthError('api.modules.auth.validation.user_not_found');

      const rbacData = JSON.stringify({
        roles: user.roles,
        permissions: user.permissions
      });

      await this.sessionRepo.createCacheRbac(String(user.id), rbacData, 3600); // 1 jam

      return {
        id: String(user.id),
        email: user.email,
        roles: user.roles,
        permissions: user.permissions
      };
    }

    return {
      id: String(userId),
      email: payload.email,
      roles: JSON.parse(rbac).roles,
      permissions: JSON.parse(rbac).permissions
    };
  }

  async logout(token: string) {
    const payload = await verifyToken(token);
    await this.sessionRepo.deleteSession(payload.jti);
  }
}
