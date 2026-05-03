import { UsersService } from "../services/users-service";

const usersService = new UsersService();

export class UsersController {
  async login({ body, set }: any) {
    try {
      const { email, password } = body;
      const token = await usersService.login(email, password);

      set.status = 200;
      return {
        message: "Login successful",
        data: token,
      };
    } catch (error: any) {
      set.status = 401;

      let code = "LOGIN_FAILED";
      let message = error.message || "Invalid credentials";

      if (error.message === "USER_NOT_FOUND") {
        code = "USER_NOT_FOUND";
        message = "User does not exist";
      } else if (error.message === "INVALID_CREDENTIALS") {
        code = "INVALID_CREDENTIALS";
        message = "Invalid password";
      }

      return {
        message: "Login failed",
        data: {
          code,
          message,
        },
      };
    }
  }

  async verify({ headers, query, set }: any) {
    try {
      const authHeader = headers["authorization"] || "";
      let token = authHeader.replace("Bearer ", "");

      if (!token && query.access_token) {
        token = query.access_token;
      }

      if (!token) {
        set.status = 401;
        return {
          message: "Verification failed",
          data: {
            code: "MISSING_TOKEN",
            message: "No access token provided",
          },
        };
      }

      const user = await usersService.verify(token);
      set.status = 200;
      return {
        message: "Verification successful",
        data: user,
      };
    } catch (error: any) {
      set.status = 401;
      return {
        message: "Verification failed",
        data: {
          code: "INVALID_OR_EXPIRED_TOKEN",
          message: error.message || "Invalid token",
        },
      };
    }
  }
}
