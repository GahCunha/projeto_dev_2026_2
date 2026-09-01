import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/environment.js";
import { AppError } from "../../shared/errors/app-error.js";
import { authRepository } from "./auth.repository.js";
import type { LoginInput } from "./auth.schemas.js";

export const authService = {
  async login(data: LoginInput) {
    const user = await authRepository.findUserByEmail(data.email);
    const passwordMatches = user ? await compare(data.password, user.passwordHash) : false;

    if (!user || !passwordMatches) {
      throw new AppError("E-mail ou senha inválidos.", 401, "INVALID_CREDENTIALS");
    }

    const token = jwt.sign({}, env.JWT_SECRET, {
      subject: user.id,
      expiresIn: env.JWT_EXPIRES_SECONDS,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  },
};
