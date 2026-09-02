import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { listEnrollments } from "./enrollment.controller.js";

export const adminEnrollmentRoutes = Router();

adminEnrollmentRoutes.get("/", authenticate, listEnrollments);
