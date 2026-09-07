import type { RequestHandler } from "express";
import { dashboardService } from "./dashboard.service.js";

export const getDashboardSummary: RequestHandler = async (_req, res) => {
  res.json({ data: await dashboardService.getSummary() });
};
