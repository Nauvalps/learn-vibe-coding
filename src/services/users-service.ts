import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";

export class UsersService {
  async login(email: string, password: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    if (user.password !== password) {
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
}
