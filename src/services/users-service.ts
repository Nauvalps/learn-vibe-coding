import { db } from "../db";
import { users, sessions } from "../models/users-model";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export class UsersService {
  async findUserByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(data: typeof users.$inferInsert) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const result = await db.insert(users).values({
      ...data,
      password: hashedPassword,
    });
    
    const [createdUser] = await db.select().from(users).where(eq(users.id, result[0].insertId)).limit(1);
    return createdUser;
  }

  async verifyPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  async login(email: string, password: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const isValid = await this.verifyPassword(password, user.password);
    if (!isValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const token = crypto.randomUUID();
    const sessionId = crypto.randomUUID();

    await db.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      token: token,
      expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await db.update(users).set({ accessToken: token }).where(eq(users.id, user.id));

    return token;
  }

  async verify(token: string) {
    const [user] = await db.select().from(users).where(eq(users.accessToken, token)).limit(1);

    if (!user) {
      throw new Error("INVALID_TOKEN");
    }

    const [session] = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);

    if (!session || (session.expiredAt && session.expiredAt < new Date())) {
      throw new Error("TOKEN_EXPIRED");
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async logout(token: string) {
    await db.delete(sessions).where(eq(sessions.token, token));
    await db.update(users).set({ accessToken: null }).where(eq(users.accessToken, token));
  }
}

export const usersService = new UsersService();
