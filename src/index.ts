import { Elysia } from "elysia";
import * as dotenv from "dotenv";
import { usersRoutes } from "./routes/users-route";

dotenv.config();

export const app = new Elysia()
  .get("/", () => "Hello World")
  .use(usersRoutes)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
