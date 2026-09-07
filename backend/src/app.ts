import "express-async-errors";
import cookieParser from "cookie-parser";
import express from "express";
import { resolve } from "node:path";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./docs/openapi.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import {
  adminClassRoutes,
  adminWorkshopClassRoutes,
} from "./modules/classes/class.admin.routes.js";
import {
  publicClassRoutes,
  publicWorkshopClassRoutes,
} from "./modules/classes/class.routes.js";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes.js";
import { adminEnrollmentRoutes } from "./modules/enrollments/enrollment.admin.routes.js";
import { publicEnrollmentRoutes } from "./modules/enrollments/enrollment.routes.js";
import { errorHandler } from "./shared/middleware/error-handler.js";
import { adminWorkshopRoutes } from "./modules/workshops/workshop.admin.routes.js";
import { publicWorkshopRoutes } from "./modules/workshops/workshop.routes.js";
import { env } from "./config/environment.js";

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
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

const frontendPath = env.FRONTEND_DIST_PATH
  ? resolve(env.FRONTEND_DIST_PATH)
  : undefined;

if (frontendPath) app.use(express.static(frontendPath));

app.get("/api/saude", (_req, res) => {
  res.json({ status: "ok", service: "feito-a-mao-api" });
});

app.use("/api/oficinas", publicWorkshopRoutes);
app.use("/api/oficinas/:workshopId/turmas", publicWorkshopClassRoutes);
app.use("/api/turmas", publicClassRoutes);
app.use("/api/inscricoes", publicEnrollmentRoutes);
app.use("/api/admin/auth", authRoutes);
app.use("/api/admin/resumo", dashboardRoutes);
app.use("/api/admin/inscricoes", adminEnrollmentRoutes);
app.use("/api/admin/oficinas", adminWorkshopRoutes);
app.use("/api/admin/oficinas/:workshopId/turmas", adminWorkshopClassRoutes);
app.use("/api/admin/turmas", adminClassRoutes);

app.use((req, res, next) => {
  if (frontendPath && !req.path.startsWith("/api")) {
    res.sendFile("index.html", { root: frontendPath });
    return;
  }

  next();
});

app.use((_req, res) => {
  res
    .status(404)
    .json({ error: "ROUTE_NOT_FOUND", message: "Rota não encontrada." });
});

app.use(errorHandler);
