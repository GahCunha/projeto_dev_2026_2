import "express-async-errors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./docs/openapi.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { adminEnrollmentRoutes } from "./modules/enrollments/enrollment.admin.routes.js";
import { publicEnrollmentRoutes } from "./modules/enrollments/enrollment.routes.js";
import { errorHandler } from "./shared/middleware/error-handler.js";
import { publicWorkshopRoutes } from "./modules/workshops/workshop.routes.js";

export const app = express();

app.disable("x-powered-by");
app.get("/api/docs.json", (_req, res) => res.json(openApiDocument));
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: "Feito à Mão API",
    customCss: ".swagger-ui .topbar { display: none }",
  }),
);
app.use(helmet());
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/api/saude", (_req, res) => {
  res.json({ status: "ok", service: "feito-a-mao-api" });
});

app.use("/api/oficinas", publicWorkshopRoutes);
app.use("/api/inscricoes", publicEnrollmentRoutes);
app.use("/api/admin/auth", authRoutes);
app.use("/api/admin/inscricoes", adminEnrollmentRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "ROUTE_NOT_FOUND", message: "Rota não encontrada." });
});

app.use(errorHandler);
