import type { RequestHandler } from "express";
import {
  createEnrollmentSchema,
  cancellationTokenParamsSchema,
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

export const getEnrollmentCancellation: RequestHandler = async (req, res) => {
  const { token } = cancellationTokenParamsSchema.parse(req.params);
  const enrollment = await enrollmentService.getCancellation(token);

  res.json({ data: enrollment });
};

export const cancelEnrollment: RequestHandler = async (req, res) => {
  const { token } = cancellationTokenParamsSchema.parse(req.params);
  const enrollment = await enrollmentService.cancelWithToken(token);

  res.json({ data: enrollment });
};
