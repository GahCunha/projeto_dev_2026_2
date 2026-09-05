import { Router } from "express";
import {
  cancelEnrollment,
  createEnrollment,
  getEnrollmentCancellation,
} from "./enrollment.controller.js";

export const publicEnrollmentRoutes = Router();

publicEnrollmentRoutes.post("/", createEnrollment);
publicEnrollmentRoutes.get("/cancelamento/:token", getEnrollmentCancellation);
publicEnrollmentRoutes.post("/cancelamento/:token", cancelEnrollment);
