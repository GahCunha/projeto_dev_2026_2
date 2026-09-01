import { Router } from "express";
import { getActiveWorkshop, listActiveWorkshops } from "./workshop.controller.js";

export const publicWorkshopRoutes = Router();

publicWorkshopRoutes.get("/", listActiveWorkshops);
publicWorkshopRoutes.get("/:id", getActiveWorkshop);


