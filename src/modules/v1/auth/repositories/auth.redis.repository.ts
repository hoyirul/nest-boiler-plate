import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_URL } from '@/core/config/redis';

@Injectable()
export class AuthSessionRedisRepository {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(REDIS_URL);
    this.redis.on('error', (err) => console.error('Redis error:', err));
  }

  async createSession(userId: string, jti: string, ttlSeconds: number) {
    const key = `token:${jti}`;
    await this.redis.set(key, userId, 'EX', ttlSeconds);
  }

  async createCacheRbac(userId: string, rbacData: string, ttlSeconds: number) {
    const key = `rbac:${userId}`;
    await this.redis.set(key, rbacData, 'EX', ttlSeconds);
  }

  async findByJti(jti: string): Promise<{ token: string | null; rbac: string | null }> {
    const tokenKey = `token:${jti}`;
    const token = await this.redis.get(tokenKey);
    if (!token) return { token: null, rbac: null };

    const rbacKey = `rbac:${token}`;
    const rbac = await this.redis.get(rbacKey);

    return { token, rbac };
  }

  async deleteSession(jti: string) {
    const tokenKey = `token:${jti}`;
    const userId = await this.redis.get(tokenKey);
    await this.redis.del(tokenKey);

    if (userId) {
      const rbacKey = `rbac:${userId}`;
      await this.redis.del(rbacKey);
    }
  }
}
