import type { RequestHandler } from "express";
import {
  createEnrollmentSchema,
  enrollmentParamsSchema,
  listEnrollmentsQuerySchema,
  updateEnrollmentStatusSchema,
} from "./enrollment.schemas.js";
import { enrollmentService } from "./enrollment.service.js";

export const createEnrollment: RequestHandler = async (req, res) => {
  const data = createEnrollmentSchema.parse(req.body);
  const enrollment = await enrollmentService.create(data);

  res.status(201).json({ data: enrollment });
};

export const listEnrollments: RequestHandler = async (req, res) => {
  const query = listEnrollmentsQuerySchema.parse(req.query);
  const result = await enrollmentService.list(query);

  res.json({ data: result.items, pagination: result.pagination });
};

export const updateEnrollmentStatus: RequestHandler = async (req, res) => {
  const { id } = enrollmentParamsSchema.parse(req.params);
  const input = updateEnrollmentStatusSchema.parse(req.body);
  const enrollment = await enrollmentService.updateStatus(id, input);

  res.json({ data: enrollment });
};
