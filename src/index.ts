import { Elysia } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";
import * as dotenv from "dotenv";

dotenv.config();

const app = new Elysia()
  .get("/", () => "Hello World")
  .get("/users", async () => {
    try {
      const allUsers = await db.select().from(users);
      return allUsers;
    } catch (error) {
      console.error(error);
      return { error: "Failed to fetch users" };
    }
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
