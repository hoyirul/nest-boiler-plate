import dotenv from "dotenv";
dotenv.config();

import { z } from "zod";

const envSchema = z.object({
  APP_NAME: z.string().default("Express Boilerplate"),
  APP_ENV: z.enum(["development", "production", "test"]).default("development"),
  APP_DEBUG: z.boolean().default(true),
  APP_HOST: z.string().default("localhost"),
  APP_PORT: z.number().default(3000),

  // Database
  DB_CONNECTION: z.enum(["mysql", "postgres", "sqlite"]).default("mysql"),
  DB_HOST: z.string().min(1),
  DB_PORT: z.number().default(3306),
  DB_USER: z.string().min(1),
  DB_PASS: z.string().min(1),
  DB_NAME: z.string().min(1),

  // JWT
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default("1d"),

  // Logging & session
  LOG_LEVEL: z.string().optional(),
  LOG_PATH: z.string().optional(),
  SESSION_SECRET: z.string().min(1),

  // Cache
  CACHE_TTL: z.number().default(600),

  // Rate limit
  RATE_LIMIT_WINDOW_MINUTES: z.number().default(15),
  RATE_LIMIT_MAX_REQUEST: z.number().default(100),
});

// Parse env variables
export const env = envSchema.parse({
  APP_NAME: process.env.APP_NAME,
  APP_ENV: process.env.APP_ENV,
  APP_DEBUG: process.env.APP_DEBUG === "true",
  APP_HOST: process.env.APP_HOST,
  APP_PORT: process.env.APP_PORT ? Number(process.env.APP_PORT) : undefined,

  DB_CONNECTION: process.env.DB_CONNECTION,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_NAME: process.env.DB_NAME,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,

  LOG_LEVEL: process.env.LOG_LEVEL,
  LOG_PATH: process.env.LOG_PATH,
  SESSION_SECRET: process.env.SESSION_SECRET,

  CACHE_TTL: process.env.CACHE_TTL ? Number(process.env.CACHE_TTL) : undefined,

  RATE_LIMIT_WINDOW_MINUTES: process.env.RATE_LIMIT_WINDOW_MINUTES
    ? Number(process.env.RATE_LIMIT_WINDOW_MINUTES)
    : undefined,
  RATE_LIMIT_MAX_REQUEST: process.env.RATE_LIMIT_MAX_REQUEST
    ? Number(process.env.RATE_LIMIT_MAX_REQUEST)
    : undefined,
});
