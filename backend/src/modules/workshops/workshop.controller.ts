import type { RequestHandler } from "express";
import {
  createWorkshopSchema,
  updateWorkshopSchema,
  workshopParamsSchema,
} from "./workshop.schemas.js";
import { workshopService } from "./workshop.service.js";

export const listActiveWorkshops: RequestHandler = async (_req, res) => {
  const workshops = await workshopService.listActive();
  res.json({ data: workshops });
};

export const getActiveWorkshop: RequestHandler = async (req, res) => {
  const { id } = workshopParamsSchema.parse(req.params);
  const workshop = await workshopService.findActiveById(id);
  res.json({ data: workshop });
};

export const createWorkshop: RequestHandler = async (req, res) => {
  const data = createWorkshopSchema.parse(req.body);
  const workshop = await workshopService.create(data);
  res.status(201).json({ data: workshop });
};

export const updateWorkshop: RequestHandler = async (req, res) => {
  const { id } = workshopParamsSchema.parse(req.params);
  const data = updateWorkshopSchema.parse(req.body);
  const workshop = await workshopService.update(id, data);
  res.json({ data: workshop });
};


