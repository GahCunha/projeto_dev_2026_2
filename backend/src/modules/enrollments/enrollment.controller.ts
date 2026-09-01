import type { RequestHandler } from "express";
import { createEnrollmentSchema } from "./enrollment.schemas.js";
import { enrollmentService } from "./enrollment.service.js";

export const createEnrollment: RequestHandler = async (req, res) => {
  const data = createEnrollmentSchema.parse(req.body);
  const enrollment = await enrollmentService.create(data);

  res.status(201).json({ data: enrollment });
};
