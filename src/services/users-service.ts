import { db } from "../db";
import { users } from "../models/users-model";
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
    
    // Fetch the created user
    const [createdUser] = await db.select().from(users).where(eq(users.id, result[0].insertId)).limit(1);
    return createdUser;
  }

  async verifyPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
}

export const usersService = new UsersService();
