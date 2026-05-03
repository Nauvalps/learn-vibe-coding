import { Elysia, t } from "elysia";
import { UsersController } from "../controllers/users-controller";

const usersController = new UsersController();

export const usersRoutes = new Elysia()
  .group("/users", (app) =>
    app
      .post("/login", usersController.login, {
        body: t.Object({
          email: t.String(),
          password: t.String(),
        }),
      })
      .get("/verify", usersController.verify)
  )
  .group("/api/users", (app) =>
    app.get("/current", usersController.current)
  );

