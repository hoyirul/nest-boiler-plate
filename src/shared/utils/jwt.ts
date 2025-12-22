import { SignJWT, jwtVerify } from "jose";
import { AuthError } from "@/shared/utils/errors";
import { env } from "@/core/config/env";

const JWT_SECRET = env.JWT_SECRET;

const getSecretKey = (): Uint8Array => {
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw AuthError("api.modules.auth.validation.invalid_jwt_secret");
  }

  return new TextEncoder().encode(JWT_SECRET);
};

export interface TokenPayload {
  id: string;
  email: string;
  [key: string]: unknown;
}

/**
 * Create JWT token
 */
export const createToken = async (
  payload: TokenPayload,
  expiresInSeconds?: number
): Promise<string> => {
  const secretKey = getSecretKey();

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(
      Math.floor(Date.now() / 1000) +
        (expiresInSeconds ??
          parseExpiresToSeconds(env.JWT_EXPIRES_IN) ??
          86400)
    )
    .sign(secretKey);
};

/**
 * Verify JWT token
 */
export const verifyToken = async (
  token: string
): Promise<TokenPayload> => {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);

    return payload as TokenPayload;
  } catch {
    throw AuthError("api.modules.auth.validation.invalid_token");
  }
};

/**
 * Convert "1d" | "12h" | "3600" → seconds
 */
const parseExpiresToSeconds = (
  value?: string
): number | null => {
  if (!value) return null;

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) return null;

  const num = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return num;
    case "m":
      return num * 60;
    case "h":
      return num * 60 * 60;
    case "d":
      return num * 60 * 60 * 24;
    default:
      return null;
  }
};
