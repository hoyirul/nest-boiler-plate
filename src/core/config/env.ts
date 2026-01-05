import dotenv from "dotenv";
dotenv.config();

import { z } from "zod";

const envSchema = z.object({
  APP_NAME: z.string().default("NestJS Boilerplate"),
  APP_ENV: z.enum(["development", "production", "test"]).default("development"),
  APP_DEBUG: z.boolean().default(true),
  APP_HOST: z.string().default("localhost"),
  APP_PORT: z.number().default(3000),
  PUBLIC_URL: z.string().default("http://localhost:3000"),

  // Database
  DB_CONNECTION: z.enum(["mysql", "postgres", "sqlite"]).default("postgres"),
  DB_HOST: z.string().min(1),
  DB_PORT: z.number().default(5432),
  DB_USER: z.string().min(1),
  DB_PASS: z.string().min(1),
  DB_NAME: z.string().min(1),

  // Redis
  REDIS_HOST: z.string().default("127.0.0.1"),
  REDIS_PORT: z.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.number().default(0),

  // JWT
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default("1d"),

  // Logging & session
  LOG_LEVEL: z.string().optional(),
  LOG_PATH: z.string().optional(),
  SESSION_SECRET: z.string().min(1),

  // Upload
  UPLOAD_DRIVER: z.enum(["local", "s3"]).default("local"),
  UPLOAD_DIR: z.string().default("storage/public/uploads"),
  UPLOAD_MAX_SIZE: z.number().default(2_000_000),
  UPLOAD_ALLOWED_MIME: z.string().default("image/png,application/pdf,image/jpeg,image/jpg,application/xlsx,application/xls"),

  // S3 (if UPLOAD_DRIVER is s3)
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),

  // Cache
  CACHE_TTL: z.number().default(600),

  // Rate Limit
  RATE_LIMIT_GLOBAL_TTL: z.number().default(60),
  RATE_LIMIT_GLOBAL_COUNT: z.number().default(20),
  RATE_LIMIT_AUTH_TTL: z.number().default(60),
  RATE_LIMIT_AUTH_COUNT: z.number().default(5),
  RATE_LIMIT_SENSITIVE_TTL: z.number().default(60),
  RATE_LIMIT_SENSITIVE_COUNT: z.number().default(3),
  RATE_LIMIT_ADMIN_TTL: z.number().default(60),
  RATE_LIMIT_ADMIN_COUNT: z.number().default(100),

  // CORS
  CORS_ORIGIN_URL: z.string().default("http://localhost:3000"),
});

// Parse env variables
export const env = envSchema.parse({
  APP_NAME: process.env.APP_NAME,
  APP_ENV: process.env.APP_ENV,
  APP_DEBUG: process.env.APP_DEBUG === "true",
  APP_HOST: process.env.APP_HOST,
  APP_PORT: process.env.APP_PORT ? Number(process.env.APP_PORT) : undefined,
  PUBLIC_URL: process.env.PUBLIC_URL,

  DB_CONNECTION: process.env.DB_CONNECTION,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_NAME: process.env.DB_NAME,

  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_DB: process.env.REDIS_DB ? Number(process.env.REDIS_DB) : undefined,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,

  LOG_LEVEL: process.env.LOG_LEVEL,
  LOG_PATH: process.env.LOG_PATH,
  SESSION_SECRET: process.env.SESSION_SECRET,
  CACHE_TTL: process.env.CACHE_TTL ? Number(process.env.CACHE_TTL) : undefined,

  UPLOAD_DRIVER: process.env.UPLOAD_DRIVER,
  UPLOAD_DIR: process.env.UPLOAD_DIR,
  UPLOAD_MAX_SIZE: process.env.UPLOAD_MAX_SIZE ? Number(process.env.UPLOAD_MAX_SIZE) : undefined,
  UPLOAD_ALLOWED_MIME: process.env.UPLOAD_ALLOWED_MIME,

  S3_REGION: process.env.S3_REGION,
  S3_BUCKET: process.env.S3_BUCKET,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,

  RATE_LIMIT_GLOBAL_TTL: process.env.RATE_LIMIT_GLOBAL_TTL
    ? Number(process.env.RATE_LIMIT_GLOBAL_TTL)
    : undefined,
  RATE_LIMIT_GLOBAL_COUNT: process.env.RATE_LIMIT_GLOBAL_COUNT
    ? Number(process.env.RATE_LIMIT_GLOBAL_COUNT)
    : undefined,
  RATE_LIMIT_AUTH_TTL: process.env.RATE_LIMIT_AUTH_TTL
    ? Number(process.env.RATE_LIMIT_AUTH_TTL)
    : undefined,
  RATE_LIMIT_AUTH_COUNT: process.env.RATE_LIMIT_AUTH_COUNT
    ? Number(process.env.RATE_LIMIT_AUTH_COUNT)
    : undefined,
  RATE_LIMIT_SENSITIVE_TTL: process.env.RATE_LIMIT_SENSITIVE_TTL
    ? Number(process.env.RATE_LIMIT_SENSITIVE_TTL)
    : undefined,
  RATE_LIMIT_SENSITIVE_COUNT: process.env.RATE_LIMIT_SENSITIVE_COUNT
    ? Number(process.env.RATE_LIMIT_SENSITIVE_COUNT)
    : undefined,
  RATE_LIMIT_ADMIN_TTL: process.env.RATE_LIMIT_ADMIN_TTL
    ? Number(process.env.RATE_LIMIT_ADMIN_TTL)
    : undefined,
  RATE_LIMIT_ADMIN_COUNT: process.env.RATE_LIMIT_ADMIN_COUNT
    ? Number(process.env.RATE_LIMIT_ADMIN_COUNT)
    : undefined,

  CORS_ORIGIN_URL: process.env.CORS_ORIGIN_URL,
});

// Helper untuk array dari CSV
export const corsOrigins = env.CORS_ORIGIN_URL.split(',').map((url) => url.trim());
