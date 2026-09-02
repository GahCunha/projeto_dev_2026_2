import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate.js";
import {
  createWorkshop,
  listWorkshops,
  updateWorkshop,
  updateWorkshopStatus,
} from "./workshop.controller.js";

export const adminWorkshopRoutes = Router();

adminWorkshopRoutes.get("/", authenticate, listWorkshops);
adminWorkshopRoutes.post("/", authenticate, createWorkshop);
adminWorkshopRoutes.patch("/:id/status", authenticate, updateWorkshopStatus);
adminWorkshopRoutes.patch("/:id", authenticate, updateWorkshop);
