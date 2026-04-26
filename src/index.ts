import { Elysia } from "elysia";
import { usersRoute } from "./routes/users-route";
import * as dotenv from "dotenv";

dotenv.config();

const app = new Elysia()
  .get("/", () => "Hello World")
  .use(usersRoute)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
