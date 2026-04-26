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

      const user = await usersService.createUser({ name, email, password });

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

      const user = await usersService.findUserByEmail(email);
      if (!user) {
        set.status = 401;
        return { message: "Invalid credentials" };
      }

      const isValid = await usersService.verifyPassword(password, user.password);
      if (!isValid) {
        set.status = 401;
        return { message: "Invalid credentials" };
      }

      return {
        message: "Login successful",
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
}

export const usersController = new UsersController();
