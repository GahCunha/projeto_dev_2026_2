import { EnrollmentStatus } from "@prisma/client";
import { prisma } from "../../config/database.js";
import type { CreateEnrollmentInput } from "./enrollment.schemas.js";

export const enrollmentRepository = {
  countActiveByWorkshop(workshopId: string) {
    return prisma.enrollment.count({
      where: {
        workshopId,
        status: { not: EnrollmentStatus.CANCELADA },
      },
    });
  },

  create(data: CreateEnrollmentInput) {
    return prisma.enrollment.create({
      data: {
        ...data,
        status: EnrollmentStatus.PENDENTE,
      },
    });
  },
};
