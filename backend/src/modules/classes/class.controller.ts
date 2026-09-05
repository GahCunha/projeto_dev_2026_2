import type { RequestHandler } from "express";
import {
  classParamsSchema,
  createClassSchema,
  updateClassSchema,
  updateClassStatusSchema,
  workshopClassParamsSchema,
} from "./class.schemas.js";
import { classService } from "./class.service.js";

export const listPublicClasses: RequestHandler = async (req, res) => {
  const { workshopId } = workshopClassParamsSchema.parse(req.params);
  res.json({ data: await classService.listPublicByWorkshop(workshopId) });
};

export const getPublicClass: RequestHandler = async (req, res) => {
  const { id } = classParamsSchema.parse(req.params);
  res.json({ data: await classService.findPublicById(id) });
};

export const listClasses: RequestHandler = async (req, res) => {
  const { workshopId } = workshopClassParamsSchema.parse(req.params);
  res.json({ data: await classService.listByWorkshop(workshopId) });
};

export const createClass: RequestHandler = async (req, res) => {
  const { workshopId } = workshopClassParamsSchema.parse(req.params);
  const data = createClassSchema.parse(req.body);
  res.status(201).json({ data: await classService.create(workshopId, data) });
};

export const updateClass: RequestHandler = async (req, res) => {
  const { id } = classParamsSchema.parse(req.params);
  const data = updateClassSchema.parse(req.body);
  res.json({ data: await classService.update(id, data) });
};

export const updateClassStatus: RequestHandler = async (req, res) => {
  const { id } = classParamsSchema.parse(req.params);
  const { active } = updateClassStatusSchema.parse(req.body);
  res.json({ data: await classService.updateStatus(id, active) });
};
