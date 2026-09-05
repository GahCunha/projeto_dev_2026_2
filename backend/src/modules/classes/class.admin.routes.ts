import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate.js";
import {
  createClass,
  listClasses,
  updateClass,
  updateClassStatus,
} from "./class.controller.js";

export const adminClassRoutes = Router();
export const adminWorkshopClassRoutes = Router({ mergeParams: true });

adminWorkshopClassRoutes.get("/", authenticate, listClasses);
adminWorkshopClassRoutes.post("/", authenticate, createClass);
adminClassRoutes.patch("/:id/status", authenticate, updateClassStatus);
adminClassRoutes.patch("/:id", authenticate, updateClass);
