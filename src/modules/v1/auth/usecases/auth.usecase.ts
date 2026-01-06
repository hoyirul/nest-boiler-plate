import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { AuthRepository } from '@/modules/v1/auth/repositories/auth.repository';
import { RedisCache } from '@/shared/redis/cache.redis';
import { LoginDTO } from '@/modules/v1/auth/domains/auth.types';
import { AuthError } from '@/shared/utils/errors';
import { createToken, verifyToken } from '@/shared/utils/jwt';
import { env } from '@/core/config/env';

@Injectable()
export class AuthUseCase {
  constructor(
    private readonly repo: AuthRepository,
    private readonly redis: RedisCache
  ) {}

  async login(payload: LoginDTO) {
    const user = await this.repo.findByEmail(payload.email);
    if (!user) throw AuthError('api.modules.auth.validation.invalid_credentials');

    const banned = user.status === 'banned';
    if (banned) throw AuthError('api.modules.auth.validation.user_banned');

    const valid = await bcrypt.compare(payload.password, user.password);
    if (!valid) throw AuthError('api.modules.auth.validation.invalid_credentials');

    const expiresInSec = parseInt(env.JWT_EXPIRES_IN) || 86400; // default 1 day
    const { token, jti, exp } = await createToken({ id: String(user.id), email: user.email }, expiresInSec);

    const ttl = exp - Math.floor(Date.now() / 1000);
    await this.redis.createSession(String(user.id), jti, ttl);

    // rbac
    const userRBAC = await this.repo.findByIdWithRbac(String(user.id));
    const rbacData = JSON.stringify({
      roles: userRBAC!.roles,
      permissions: userRBAC!.permissions
    });
    // cache rbac just 15 minutes
    await this.redis.createCacheRbac(String(user.id), rbacData, 900); // 15 minutes

    return {
      token_type: 'Bearer',
      access_token: "******************", // hide actual token
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
    const { token: userId, rbac } = await this.redis.findByJti(payload.jti);
    if (!userId) throw AuthError('api.modules.auth.validation.token_not_found');

    // if redis not found
    if(!rbac) {
      const user = await this.repo.findByIdWithRbac(String(userId));
      if (!user) throw AuthError('api.modules.auth.validation.user_not_found');

      const rbacData = JSON.stringify({
        roles: user.roles,
        permissions: user.permissions
      });

      await this.redis.createCacheRbac(String(user.id), rbacData, 3600); // 1 jam

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
    await this.redis.deleteSession(payload.jti);
  }
}
