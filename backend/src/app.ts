import "express-async-errors";
import express from "express";
import helmet from "helmet";
import { publicEnrollmentRoutes } from "./modules/enrollments/enrollment.routes.js";
import { errorHandler } from "./shared/middleware/error-handler.js";
import { publicWorkshopRoutes } from "./modules/workshops/workshop.routes.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "100kb" }));

app.get("/api/saude", (_req, res) => {
  res.json({ status: "ok", service: "feito-a-mao-api" });
});

app.use("/api/oficinas", publicWorkshopRoutes);
app.use("/api/inscricoes", publicEnrollmentRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "ROUTE_NOT_FOUND", message: "Rota não encontrada." });
});

app.use(errorHandler);
