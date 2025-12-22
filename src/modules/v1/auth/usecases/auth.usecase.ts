import { Injectable } from "@nestjs/common";
import bcrypt from "bcryptjs";

import { AuthRepository } from "@/modules/v1/auth/repositories/auth.repository";
import { AuthSessionRepository } from "@/modules/v1/auth/repositories/auth-session.repository";
import { LoginDTO } from "@/modules/v1/auth/domains/auth.types";
import { AuthError } from "@/shared/utils/errors";
import { createToken } from "@/shared/utils/jwt";
import { env } from "@/core/config/env";

@Injectable()
export class AuthUseCase {
  constructor(
    private readonly repo: AuthRepository,
    private readonly sessionRepo: AuthSessionRepository
  ) {}

  async login(payload: LoginDTO) {
    const user = await this.repo.findByEmail(payload.email);
    if (!user) {
      throw AuthError("api.modules.auth.validation.invalid_credentials");
    }

    const valid = await bcrypt.compare(payload.password, user.password);
    if (!valid) {
      throw AuthError("api.modules.auth.validation.invalid_credentials");
    }

    const expiresInSec = Number(env.JWT_EXPIRES_IN) || 86400;
    const expiredAt = new Date(Date.now() + expiresInSec * 1000);

    const token = await createToken({
      id: user.id,
      email: user.email,
    });

    await this.sessionRepo.createSession(
      user.id,
      token,
      expiredAt
    );

    return {
      token_type: "Bearer",
      access_token: token,
      expires_in: expiresInSec,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async me(token: string) {
    const session = await this.sessionRepo.findByToken(token);
    if (!session) {
      throw AuthError("api.modules.auth.validation.token_not_found");
    }

    const user = await this.repo.findById(session.user_id);
    if (!user) {
      throw AuthError("api.modules.auth.validation.user_not_found");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async logout(token: string): Promise<void> {
    await this.sessionRepo.deleteSession(token);
  }
}
