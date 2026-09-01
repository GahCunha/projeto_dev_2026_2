import { Router } from "express";
import { createEnrollment } from "./enrollment.controller.js";

export const publicEnrollmentRoutes = Router();

publicEnrollmentRoutes.post("/", createEnrollment);
