import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { listEnrollments, updateEnrollmentStatus } from "./enrollment.controller.js";

export const adminEnrollmentRoutes = Router();

adminEnrollmentRoutes.get("/", authenticate, listEnrollments);
adminEnrollmentRoutes.patch("/:id/status", authenticate, updateEnrollmentStatus);
