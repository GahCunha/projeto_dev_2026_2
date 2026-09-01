import type { RequestHandler } from "express";
import { env } from "../../config/environment.js";
import { authCookieOptions, clearAuthCookieOptions } from "./auth-cookie.js";
import { loginSchema } from "./auth.schemas.js";
import { authService } from "./auth.service.js";

export const login: RequestHandler = async (req, res) => {
  const data = loginSchema.parse(req.body);
  const { token, user } = await authService.login(data);

  res.cookie(env.AUTH_COOKIE_NAME, token, authCookieOptions);
  res.json({ data: user });
};

export const logout: RequestHandler = (_req, res) => {
  res.clearCookie(env.AUTH_COOKIE_NAME, clearAuthCookieOptions);
  res.status(204).send();
};

export const getCurrentUser: RequestHandler = (_req, res) => {
  res.json({ data: res.locals.user });
};
