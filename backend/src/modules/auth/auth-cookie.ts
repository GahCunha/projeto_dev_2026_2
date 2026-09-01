import type { CookieOptions } from "express";
import { env } from "../../config/environment.js";

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: "lax",
  maxAge: env.JWT_EXPIRES_SECONDS * 1000,
  path: "/",
};

export const clearAuthCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: "lax",
  path: "/",
};
