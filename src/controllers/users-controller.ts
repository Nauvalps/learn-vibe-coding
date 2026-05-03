import { usersService } from "../services/users-service";

export class UsersController {
  async register({ body, set }: any) {
    try {
      const { name, email, password } = body;

      // Check if user already exists
      const existingUser = await usersService.findUserByEmail(email);
      if (existingUser) {
        set.status = 409;
        return {
          message: "User created failed",
          error: {
            code: "USER_ALREADY_EXISTS",
            message: "User already exists",
          },
        };
      }

      const user = await usersService.createUser({ name, email, password } as any);

      return {
        message: "User created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    } catch (error) {
      console.error(error);
      set.status = 500;
      return { message: "Internal server error" };
    }
  }

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

  async current({ headers, set }: any) {
    try {
      const authHeader = headers["authorization"] || "";
      const token = authHeader.replace("Bearer ", "");

      if (!token) {
        set.status = 401;
        return {
          message: "Unauthorized",
          data: {
            code: "UNAUTHORIZED",
            message: "Invalid or expired token",
          },
        };
      }

      const user = await usersService.verify(token);
      const { accessToken, ...safeUser } = user as any;

      set.status = 200;
      return {
        data: safeUser,
      };
    } catch (error: any) {
      set.status = 401;
      return {
        message: "Unauthorized",
        data: {
          code: "UNAUTHORIZED",
          message: "Invalid or expired token",
        },
      };
    }
  }

  async logout({ body, set }: any) {
    try {
      const { token } = body;
      await usersService.logout(token);
      set.status = 200;
      return {
        data: "OK",
      };
    } catch (error: any) {
      set.status = 400;
      return {
        message: "Logout failed",
        error: error.message || "Failed to logout",
      };
    }
  }
}

export const usersController = new UsersController();
