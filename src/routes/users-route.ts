import { Elysia, t } from "elysia";
import { usersController } from "../controllers/users-controller";

// Regex for name: 3-30 chars, letters, numbers, underscore, dot, NO SPACES
const nameRegex = /^[a-zA-Z0-9_.\s]{3,30}$/;
// Regex for no spaces
const noSpaceRegex = /^\S+$/;

export const usersRoute = new Elysia({ prefix: "/users" })
  .post("/register", usersController.register, {
    body: t.Object({
      name: t.String({
        pattern: nameRegex.source,
        error: "Name must be 3-30 chars and only contain alphanumeric, underscore, dot, or spaces.",
      }),
      email: t.String({
        format: "email",
        pattern: noSpaceRegex.source,
        error: "Invalid email format or contains spaces.",
      }),
      password: t.String({
        minLength: 6,
        maxLength: 100,
        pattern: noSpaceRegex.source,
        error: "Password must be 6-100 characters and contain no spaces.",
      }),
    }),
  })
  .post("/login", usersController.login, {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String(),
    }),
  });
