import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

import { DefaultServer } from "@/core/db";
import { userSessions } from "@/core/db/schema/user-session.schema";

@Injectable()
export class AuthSessionRepository {
  private async getExecutor(tx?: any) {
    return tx ?? DefaultServer();
  }

  async createSession(
    userId: string,
    token: string,
    expiredAt: Date,
    tx?: any
  ) {
    const db = await this.getExecutor(tx);

    const refreshToken = randomUUID();
    const refreshExpiredAt = new Date(
      expiredAt.getTime() + 1000 * 60 * 60 * 24 * 7
    );

    await db.insert(userSessions).values({
      user_id: userId,
      token,
      refresh_token: refreshToken,
      expired_at: expiredAt,
      refresh_expired_at: refreshExpiredAt,
    });

    return {
      user_id: userId,
      token,
      expired_at: expiredAt,
      refresh_token: refreshToken,
      refresh_expired_at: refreshExpiredAt,
    };
  }

  async findByToken(token: string, tx?: any) {
    const db = await this.getExecutor(tx);

    const result = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.token, token))
      .limit(1);

    return result[0] ?? null;
  }

  async deleteSession(token: string, tx?: any) {
    const db = await this.getExecutor(tx);

    return db
      .delete(userSessions)
      .where(eq(userSessions.token, token));
  }
}
