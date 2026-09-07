import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { getDashboardSummary } from "./dashboard.controller.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/", authenticate, getDashboardSummary);
