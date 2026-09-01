import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/environment.js";
import { authRepository } from "../../modules/auth/auth.repository.js";
import { AppError } from "../errors/app-error.js";

export const authenticate: RequestHandler = async (req, res, next) => {
  const token = req.cookies[env.AUTH_COOKIE_NAME] as string | undefined;

  if (!token) {
    throw new AppError("Autenticação necessária.", 401, "UNAUTHENTICATED");
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const userId = typeof payload === "string" ? undefined : payload.sub;

    if (!userId) {
      throw new Error("Token sem identificação de usuário");
    }

    const user = await authRepository.findUserById(userId);

    if (!user) {
      throw new Error("Usuário do token não existe");
    }

    res.locals.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    next();
  } catch {
    throw new AppError("Sessão inválida ou expirada.", 401, "INVALID_SESSION");
  }
};
