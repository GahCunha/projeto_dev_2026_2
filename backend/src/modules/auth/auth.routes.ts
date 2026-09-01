import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { getCurrentUser, login, logout } from "./auth.controller.js";

export const authRoutes = Router();

authRoutes.post("/login", login);
authRoutes.post("/logout", authenticate, logout);
authRoutes.get("/me", authenticate, getCurrentUser);
