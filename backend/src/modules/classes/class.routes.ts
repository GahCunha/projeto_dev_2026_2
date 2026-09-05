import { Router } from "express";
import { getPublicClass, listPublicClasses } from "./class.controller.js";

export const publicClassRoutes = Router();
export const publicWorkshopClassRoutes = Router({ mergeParams: true });

publicClassRoutes.get("/:id", getPublicClass);
publicWorkshopClassRoutes.get("/", listPublicClasses);
