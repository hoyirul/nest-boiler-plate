import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DefaultServer } from "@/core/db";
import { users } from "@/core/db/schema/user.schema";

@Injectable()
export class AuthRepository {
  private async getExecutor(tx?: any) {
    return tx ?? DefaultServer();
  }

  async findByEmail(email: string, tx?: any) {
    const db = await this.getExecutor(tx);

    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] ?? null;
  }

  async findById(id: string, tx?: any) {
    const db = await this.getExecutor(tx);

    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] ?? null;
  }
}
