import { env } from './env';

export const REDIS_URL = env.REDIS_PASSWORD
  ? `redis://:${env.REDIS_PASSWORD}@${env.REDIS_HOST}:${env.REDIS_PORT}/${env.REDIS_DB ?? 0}`
  : `redis://${env.REDIS_HOST}:${env.REDIS_PORT}/${env.REDIS_DB ?? 0}`;
